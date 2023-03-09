import { Octokit } from 'octokit';

export class GitHub {
  private _octokit: Octokit;
  constructor(token: string) {
    this._octokit = new Octokit({
      auth: token,
    });
  }

  async commit() {
    this._octokit.rest.repos.createOrUpdateFileContents({
      owner: 'joshua-meyers',
      repo: 'insomnia-plugin-github',
      path: 'test.txt',
      message: 'test',
      content: 'test',
      committer: {
        name: 'Joshua Meyers',
        email: '',
      },
    });
  }
}