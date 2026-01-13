export interface DockerManagerConfig {
  composePath?: string;
  projectName?: string;
  registry?: string;
  imageName?: string;
  tag?: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  ports: PortMapping[];
  createdAt: Date;
  startedAt?: Date;
}

export type ContainerStatus = 
  | 'created'
  | 'running'
  | 'paused'
  | 'restarting'
  | 'removing'
  | 'exited'
  | 'dead';

export interface PortMapping {
  internal: number;
  external: number;
  protocol: 'tcp' | 'udp';
}

export interface DockerImage {
  id: string;
  name: string;
  tag: string;
  size: number;
  createdAt: Date;
}

export interface DockerComposeConfig {
  version?: string;
  services: Record<string, DockerService>;
  volumes?: Record<string, VolumeConfig>;
  networks?: Record<string, NetworkConfig>;
}

export interface DockerService {
  image?: string;
  build?: BuildConfig;
  ports?: string[];
  volumes?: string[];
  environment?: Record<string, string>;
  depends_on?: string[];
  restart?: RestartPolicy;
  networks?: string[];
  command?: string | string[];
  healthcheck?: ServiceHealthCheck;
}

export interface BuildConfig {
  context: string;
  dockerfile?: string;
  args?: Record<string, string>;
}

export type RestartPolicy = 'no' | 'always' | 'on-failure' | 'unless-stopped';

export interface VolumeConfig {
  driver?: string;
  driver_opts?: Record<string, string>;
  external?: boolean;
}

export interface NetworkConfig {
  driver?: string;
  external?: boolean;
}

export interface ServiceHealthCheck {
  test: string | string[];
  interval?: string;
  timeout?: string;
  retries?: number;
  start_period?: string;
}

export interface DockerManager {
  listContainers: () => Promise<DockerContainer[]>;
  listImages: () => Promise<DockerImage[]>;
  startContainer: (nameOrId: string) => Promise<void>;
  stopContainer: (nameOrId: string) => Promise<void>;
  restartContainer: (nameOrId: string) => Promise<void>;
  removeContainer: (nameOrId: string, force?: boolean) => Promise<void>;
  buildImage: (name: string, tag?: string) => Promise<void>;
  pushImage: (name: string, tag?: string) => Promise<void>;
  pullImage: (name: string, tag?: string) => Promise<void>;
  composeUp: (detach?: boolean) => Promise<void>;
  composeDown: (removeVolumes?: boolean) => Promise<void>;
  composeLogs: (service?: string, follow?: boolean) => Promise<string>;
  exec: (container: string, command: string) => Promise<string>;
}

export interface DockerBuildOptions {
  noCache?: boolean;
  pull?: boolean;
  buildArgs?: Record<string, string>;
  target?: string;
  platform?: string;
}

