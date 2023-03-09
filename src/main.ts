import { GitHub } from "./github";
import { Context, WorkspaceAction, WorkspaceModel } from "./insomnia.interface";

class Plugin {
  private readonly _pluginPrefix = 'github-collection-sync';
  private _context: Context;
  private _models: WorkspaceModel;
  private _workspaceId: string;
  private _workspaceName: string;

  private _name: string;
  private _email: string;
  private _branch: string;
  private _accessToken: string;

  private _github: GitHub;

  constructor(context: Context, models: WorkspaceModel) {
    this._context = context;
    this._models = models;

    this._workspaceId = models.workspace._id;
    this._workspaceName = models.workspace.name;

    if (this._accessToken) {
      this._github = new GitHub(this._accessToken);
    }
  }

  private _createTextInput(name: string, placeholder: string, value: string = '') {
    const element = document.createElement('input');
    element.type = 'text';
    element.name = name;
    element.placeholder = placeholder;
    element.value = value;
    element.style.width = '100%';
    element.style.border = '1px solid #ccc';
    element.style.borderRadius = '5px';
    element.style.marginBottom = '10px';
    element.style.padding = '10px';

    return element;
  }

  private _generateBranchName() {
    return this._workspaceName = this._workspaceName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  }

  private get isConfigured() {
    return this._accessToken && this._name && this._email && this._branch;
  }

  async setConfiguration() {
    const root = document.createElement('div');
    const form = document.createElement('form');
    root.appendChild(form);

    const accessTokenElement = this._createTextInput('token', 'GitHub access token');
    form.appendChild(accessTokenElement);

    const gitConfigNameElement = this._createTextInput('name', 'Name (John Doe)');
    form.appendChild(gitConfigNameElement);

    const gitConfigEmailElement = this._createTextInput('email', 'Email');
    form.appendChild(gitConfigEmailElement);

    const defaultBranchName = this._generateBranchName();
    const branchNameElement = this._createTextInput('branch', defaultBranchName, defaultBranchName);
    form.appendChild(branchNameElement);

    const successsMessageElement = document.createElement('p');
    successsMessageElement.style.display = 'none';
    successsMessageElement.style.color = 'green';
    form.appendChild(successsMessageElement);

    // create a submit button and append it to the fieldset
    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Save';
    form.appendChild(submit);

    // prevent the form from being submitted
    form.onsubmit = (e) => {
      e.preventDefault();
      const accessToken = accessTokenElement.value;
      const name = gitConfigNameElement.value;
      const email = gitConfigEmailElement.value;
      const branch = branchNameElement.value;

      successsMessageElement.style.display = 'block';
      successsMessageElement.style.color = 'green';

      if (!accessToken || !name || !email || !branch) {
        successsMessageElement.style.color = 'red';
        successsMessageElement.innerText = 'Please fill all the fields';
        return;
      }

      this._context.store.setItem(`${this._pluginPrefix}-${this._workspaceId}-access-token`, accessToken);
      this._context.store.setItem(`${this._pluginPrefix}-${this._workspaceId}-name`, name);
      this._context.store.setItem(`${this._pluginPrefix}-${this._workspaceId}-email`, email);
      this._context.store.setItem(`${this._pluginPrefix}-${this._workspaceId}-branch`, branch);

      successsMessageElement.innerText = 'Configuration saved successfully';
    };

    this._context.app.dialog('GitHub - Setup', root, {
      skinny: true,
      onHide: async () => {
        this._accessToken = (await this._context.store.getItem(`${this._pluginPrefix}-${this._workspaceId}-access-token`)) as string;
        this._name = (await this._context.store.getItem(`${this._pluginPrefix}-${this._workspaceId}-name`)) as string;
        this._email = (await this._context.store.getItem(`${this._pluginPrefix}-${this._workspaceId}-email`)) as string;
        this._branch = (await this._context.store.getItem(`${this._pluginPrefix}-${this._workspaceId}-branch`)) as string;
      }
    })
  }

  async loadConfiguration() {
    this._accessToken = (await this._context.store.getItem(`${this._pluginPrefix}-${this._workspaceId}-access-token`)) as string;
    this._name = (await this._context.store.getItem(`${this._pluginPrefix}-${this._workspaceId}-name`)) as string;
    this._email = (await this._context.store.getItem(`${this._pluginPrefix}-${this._workspaceId}-email`)) as string;
    this._branch = (await this._context.store.getItem(`${this._pluginPrefix}-${this._workspaceId}-branch`)) as string;
  }

  async pushWorkspace() {
    // const ex = await this._context.data.export.insomnia({
    //   includePrivate: false,
    //   format: 'json',
    //   workspace: this._models.workspace,
    // });
    if (!this.isConfigured) {
      await this._context.app.alert('Failed!', 'Please setup github configuration first');
      return;
    }

    await this._context.app.alert('Success!', 'Your workspace has been pushed');
  }

  async pullWorkspace() {
    if (!this.isConfigured) {
      await this._context.app.alert('Failed!', 'Please setup github configuration first');
      return;
    }
    // await this._context.data.import.raw('');
    await this._context.app.alert('Success!', 'Your workspace has been updated');
  }
}

const workspaceActions: Array<WorkspaceAction> = [
  {
    label: 'GitHub - Setup',
    action: async (context: Context, models: WorkspaceModel) => {
      const plugin = new Plugin(context, models);
      await plugin.setConfiguration();
    }
  },
  {
    label: 'GitHub - Pull Workspace',
    action: async (context: Context, models: WorkspaceModel) => {
      const plugin = new Plugin(context, models);
      await plugin.loadConfiguration();
      await plugin.pullWorkspace();
    }
  },
  {
    label: 'GitHub - Push Workspace',
    action: async (context: Context, models: WorkspaceModel) => {
      const plugin = new Plugin(context, models);
      await plugin.loadConfiguration();
      await plugin.pushWorkspace();
    }
  }
];

export { workspaceActions }