export const he: Record<string, string> = {
  // Server
  'server.starting': 'השרת מופעל...',
  'server.started': 'השרת פועל בכתובת http://{host}:{port}',
  'server.stopping': 'השרת נעצר...',
  'server.stopped': 'השרת נעצר',
  'server.alreadyRunning': 'השרת כבר פועל',
  'server.error': 'שגיאת שרת',
  'server.gracefulShutdown': 'התקבל {signal}, מכבה בצורה מסודרת',

  // Router
  'router.registered': 'נרשם נתיב: {method} {path}',
  'router.missingRequired': 'נתיב חייב לכלול path, method ו-handler',

  // Validation
  'validation.failed': 'האימות נכשל',
  'validation.required': '{field} הוא שדה חובה',
  'validation.typeMismatch': '{field} חייב להיות מסוג {type}',
  'validation.minValue': '{field} חייב להיות לפחות {min}',
  'validation.maxValue': '{field} חייב להיות לכל היותר {max}',
  'validation.minLength': '{field} חייב להכיל לפחות {min} תווים',
  'validation.maxLength': '{field} חייב להכיל לכל היותר {max} תווים',
  'validation.pattern': '{field} לא תואם לתבנית הנדרשת',
  'validation.enum': '{field} חייב להיות אחד מ: {values}',
  'validation.invalidObjectId': '{field} אינו ObjectId תקין',
  'validation.invalidEmail': '{field} אינה כתובת אימייל תקינה',
  'validation.invalidUrl': '{field} אינו URL תקין',
  'validation.invalidDate': '{field} אינו תאריך תקין',
  'validation.customFailed': '{field} נכשל באימות מותאם אישית',

  // Errors
  'errors.badRequest': 'בקשה שגויה',
  'errors.unauthorized': 'לא מורשה',
  'errors.forbidden': 'גישה נדחתה',
  'errors.notFound': 'לא נמצא',
  'errors.conflict': 'התנגשות',
  'errors.tooManyRequests': 'יותר מדי בקשות',
  'errors.internal': 'שגיאת שרת פנימית',
  'errors.timeout': 'הבקשה פגה',
  'errors.default': 'אירעה שגיאה',

  // Config
  'config.notFound': 'קובץ הגדרות לא נמצא, משתמש בברירת מחדל',
  'config.loaded': 'הגדרות נטענו מ-{path}',
  'config.loadFailed': 'נכשל בטעינת הגדרות',

  // Docker
  'docker.containerStarted': 'קונטיינר הופעל: {name}',
  'docker.containerStopped': 'קונטיינר נעצר: {name}',
  'docker.containerRestarted': 'קונטיינר הופעל מחדש: {name}',
  'docker.containerRemoved': 'קונטיינר הוסר: {name}',
  'docker.imageBuilt': 'תמונה נבנתה: {name}:{tag}',
  'docker.imagePushed': 'תמונה הועלתה: {name}',
  'docker.imagePulled': 'תמונה הורדה: {name}:{tag}',
  'docker.composeUp': 'Docker Compose הופעל בהצלחה',
  'docker.composeDown': 'Docker Compose נעצר בהצלחה',
  'docker.commandFailed': 'פקודת Docker נכשלה: {command}',

  // Changelog
  'changelog.loaded': 'יומן שינויים נטען עם {count} רשומות',
  'changelog.saved': 'יומן שינויים נשמר ב-{path}',
  'changelog.released': 'שוחררה גרסה {version}',
  'changelog.notFound': 'קובץ יומן שינויים לא נמצא, מתחיל מחדש',

  // Portal
  'portal.generated': 'פורטל נוצר ב-{path}',
  'portal.generating': 'מייצר פורטל תיעוד...',

  // Logger
  'logger.levelChanged': 'רמת הלוג שונתה ל-{level}',

  // HTTP Logger
  'http.request': '{method} {url} {status} {duration}ms',
  'http.requestStart': 'בקשה נכנסת: {method} {url}',
  'http.requestEnd': 'בקשה הושלמה: {method} {url} - {status} תוך {duration}ms',

  // CLI
  'cli.init.success': 'פרויקט Harbor אותחל בהצלחה!',
  'cli.init.configExists': 'harbor.config.json כבר קיים',
  'cli.init.created': 'נוצר {file}',
  'cli.docs.generating': 'מייצר תיעוד API...',
  'cli.docs.success': 'התיעוד נוצר בהצלחה',
  'cli.version': 'Harbor גרסה {version}',
  'cli.unknownCommand': 'פקודה לא מוכרת: {command}',

  // Database
  'database.connected': 'מחובר ל-MongoDB ב-{uri}',
  'database.disconnected': 'נותק מ-MongoDB',
  'database.connecting': 'מתחבר ל-MongoDB...',
  'database.connectionFailed': 'החיבור ל-MongoDB נכשל: {error}',
  'database.notConnected': 'לא מחובר למסד נתונים. קרא ל-harbor.connect() קודם.',
  'database.modelCreated': 'מודל נוצר: {name}',
  'database.documentSaved': 'מסמך נשמר: {id}',
  'database.documentDeleted': 'מסמך נמחק: {id}',
  'database.validationFailed': 'האימות נכשל: {errors}',
  'database.queryExecuted': 'שאילתה בוצעה: {operation} על {collection}',
  'database.indexCreated': 'אינדקס נוצר: {name}',
  'database.transactionStarted': 'טרנזקציה התחילה',
  'database.transactionCommitted': 'טרנזקציה אושרה',
  'database.transactionAborted': 'טרנזקציה בוטלה',
};

