export interface Context {
  app: AppContext;
  data: DataContext;
  network: NetworkContext;
  store: StoreContext;
}

interface AppContext {
  getInfo(): { version: string, platform: string };
  alert(title: string, message?: string): Promise<void>;

  dialog(title: string, body: HTMLElement, options?: {
    onHide?: () => void;
    tall?: boolean;
    skinny?: boolean;
    wide?: boolean;
  }): void;

  prompt(title: string, options?: {
    label?: string;
    defaultValue?: string;
    submitName?: string;
    cancelable?: boolean;
  }): Promise<string>;

  getPath(name: string): string;

  showSaveDialog(options?: {
    defaultPath?: string;
  }): Promise<string | null>;

  clipboard: {
    readText(): string;
    writeText(text: string): void;
    clear(): void;
  };
}


interface ImportOptions {
  workspaceId?: string;
  workspaceScope?: 'design' | 'collection';
}

interface DataContext {
  import: {
    uri(uri: string, options?: ImportOptions): Promise<void>;
    raw(text: string, options?: ImportOptions): Promise<void>;
  },
  export: {
    insomnia(options?: {
      includePrivate?: boolean,
      format?: 'json' | 'yaml',
      workspace: Workspace;
    }): Promise<string>;
    har(options?: { includePrivate?: boolean }): Promise<string>;
  }
}

interface NetworkContext {
  sendRequest(request: Request): Promise<Response>;
}

interface StoreContext {
  hasItem(key: string): Promise<boolean>;
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  all(): Promise<Array<{ key: string, value: string }>>;
}

interface Workspace {
  _id: string;
  created: number;
  description: string;
  modified: number;
  name: string;
  parentId: string;
  scope: string;
  type: string;
}

export interface WorkspaceModel {
  workspace: Workspace;
  requestGroup: Array<any>;
  requests: Array<Request>;
}

export interface WorkspaceAction {
  label: string;
  icon?: string;
  action(context: Context, models: WorkspaceModel): Promise<void>;
}