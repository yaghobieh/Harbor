import { exec } from 'child_process';
import { promisify } from 'util';
import type {
  DockerManager as IDockerManager,
  DockerManagerConfig,
  DockerContainer,
  DockerImage,
  ContainerStatus,
  DockerBuildOptions,
} from '../types';
import { createLogger } from '../utils/logger';

const execAsync = promisify(exec);
const logger = createLogger('docker');

export function createDockerManager(config: DockerManagerConfig = {}): IDockerManager {
  const composePath = config.composePath ?? './docker-compose.yml';
  const projectName = config.projectName;

  async function runCommand(command: string): Promise<string> {
    try {
      logger.debug(`Executing: ${command}`);
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        logger.warn(`Command stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      logger.error(`Command failed: ${command}`, error as Error);
      throw error;
    }
  }

  function parseContainerStatus(status: string): ContainerStatus {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('running')) return 'running';
    if (statusLower.includes('exited')) return 'exited';
    if (statusLower.includes('created')) return 'created';
    if (statusLower.includes('paused')) return 'paused';
    if (statusLower.includes('restarting')) return 'restarting';
    if (statusLower.includes('removing')) return 'removing';
    if (statusLower.includes('dead')) return 'dead';
    return 'exited';
  }

  const manager: IDockerManager = {
    async listContainers(): Promise<DockerContainer[]> {
      const output = await runCommand(
        'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}|{{.CreatedAt}}"'
      );

      if (!output) return [];

      return output.split('\n').map((line) => {
        const [id, name, image, status, ports, createdAt] = line.split('|');
        return {
          id,
          name,
          image,
          status: parseContainerStatus(status),
          ports: parsePorts(ports),
          createdAt: new Date(createdAt),
        };
      });
    },

    async listImages(): Promise<DockerImage[]> {
      const output = await runCommand(
        'docker images --format "{{.ID}}|{{.Repository}}|{{.Tag}}|{{.Size}}|{{.CreatedAt}}"'
      );

      if (!output) return [];

      return output.split('\n').map((line) => {
        const [id, name, tag, size, createdAt] = line.split('|');
        return {
          id,
          name,
          tag,
          size: parseSize(size),
          createdAt: new Date(createdAt),
        };
      });
    },

    async startContainer(nameOrId: string): Promise<void> {
      await runCommand(`docker start ${nameOrId}`);
      logger.info(`Container started: ${nameOrId}`);
    },

    async stopContainer(nameOrId: string): Promise<void> {
      await runCommand(`docker stop ${nameOrId}`);
      logger.info(`Container stopped: ${nameOrId}`);
    },

    async restartContainer(nameOrId: string): Promise<void> {
      await runCommand(`docker restart ${nameOrId}`);
      logger.info(`Container restarted: ${nameOrId}`);
    },

    async removeContainer(nameOrId: string, force = false): Promise<void> {
      const forceFlag = force ? '-f' : '';
      await runCommand(`docker rm ${forceFlag} ${nameOrId}`);
      logger.info(`Container removed: ${nameOrId}`);
    },

    async buildImage(name: string, tag = 'latest', options?: DockerBuildOptions): Promise<void> {
      let command = `docker build -t ${name}:${tag}`;
      
      if (options?.noCache) command += ' --no-cache';
      if (options?.pull) command += ' --pull';
      if (options?.target) command += ` --target ${options.target}`;
      if (options?.platform) command += ` --platform ${options.platform}`;
      
      if (options?.buildArgs) {
        for (const [key, value] of Object.entries(options.buildArgs)) {
          command += ` --build-arg ${key}=${value}`;
        }
      }
      
      command += ' .';
      
      await runCommand(command);
      logger.info(`Image built: ${name}:${tag}`);
    },

    async pushImage(name: string, tag = 'latest'): Promise<void> {
      const fullName = config.registry 
        ? `${config.registry}/${name}:${tag}` 
        : `${name}:${tag}`;
      
      await runCommand(`docker push ${fullName}`);
      logger.info(`Image pushed: ${fullName}`);
    },

    async pullImage(name: string, tag = 'latest'): Promise<void> {
      await runCommand(`docker pull ${name}:${tag}`);
      logger.info(`Image pulled: ${name}:${tag}`);
    },

    async composeUp(detach = true): Promise<void> {
      let command = `docker-compose -f ${composePath}`;
      if (projectName) command += ` -p ${projectName}`;
      command += ' up';
      if (detach) command += ' -d';
      
      await runCommand(command);
      logger.info('Docker Compose up completed');
    },

    async composeDown(removeVolumes = false): Promise<void> {
      let command = `docker-compose -f ${composePath}`;
      if (projectName) command += ` -p ${projectName}`;
      command += ' down';
      if (removeVolumes) command += ' -v';
      
      await runCommand(command);
      logger.info('Docker Compose down completed');
    },

    async composeLogs(service?: string, follow = false): Promise<string> {
      let command = `docker-compose -f ${composePath}`;
      if (projectName) command += ` -p ${projectName}`;
      command += ' logs';
      if (follow) command += ' -f';
      if (service) command += ` ${service}`;
      
      return runCommand(command);
    },

    async exec(container: string, command: string): Promise<string> {
      return runCommand(`docker exec ${container} ${command}`);
    },
  };

  return manager;
}

function parsePorts(portsStr: string): DockerContainer['ports'] {
  if (!portsStr) return [];
  
  return portsStr.split(',').map((port) => {
    const match = port.match(/(\d+):(\d+)\/(\w+)/);
    if (match) {
      return {
        external: parseInt(match[1], 10),
        internal: parseInt(match[2], 10),
        protocol: match[3] as 'tcp' | 'udp',
      };
    }
    return {
      external: 0,
      internal: 0,
      protocol: 'tcp' as const,
    };
  }).filter((p) => p.internal > 0);
}

function parseSize(sizeStr: string): number {
  const match = sizeStr.match(/([\d.]+)\s*(GB|MB|KB|B)/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  switch (unit) {
    case 'GB': return value * 1024 * 1024 * 1024;
    case 'MB': return value * 1024 * 1024;
    case 'KB': return value * 1024;
    default: return value;
  }
}

export class DockerManager implements IDockerManager {
  private manager: IDockerManager;

  constructor(config: DockerManagerConfig = {}) {
    this.manager = createDockerManager(config);
  }

  listContainers = () => this.manager.listContainers();
  listImages = () => this.manager.listImages();
  startContainer = (nameOrId: string) => this.manager.startContainer(nameOrId);
  stopContainer = (nameOrId: string) => this.manager.stopContainer(nameOrId);
  restartContainer = (nameOrId: string) => this.manager.restartContainer(nameOrId);
  removeContainer = (nameOrId: string, force?: boolean) => this.manager.removeContainer(nameOrId, force);
  buildImage = (name: string, tag?: string) => this.manager.buildImage(name, tag);
  pushImage = (name: string, tag?: string) => this.manager.pushImage(name, tag);
  pullImage = (name: string, tag?: string) => this.manager.pullImage(name, tag);
  composeUp = (detach?: boolean) => this.manager.composeUp(detach);
  composeDown = (removeVolumes?: boolean) => this.manager.composeDown(removeVolumes);
  composeLogs = (service?: string, follow?: boolean) => this.manager.composeLogs(service, follow);
  exec = (container: string, command: string) => this.manager.exec(container, command);
}

