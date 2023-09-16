const inquirer = require("inquirer");
const downloadGitRepo = require("download-git-repo");
const chalk = require("chalk");
const util = require("util");
const path = require("path");
const { loading } = require("./util");
const { getZhuRongRepo, getTagsByRepo } = require("./api");

class Creator {
  constructor(name, target) {
    this.name = name;
    this.target = target;
    // 转化为 promise 方法
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }
  // 创建项目部分
  async create() {
    // 获取用户选择的模板
    let repo = await this.getRepoInfo();
    // 用户选择的版本
    let tag = await this.getTagInfo(repo);
    // 下载模板 所选信息
    await this.download(repo, tag);
    // 模板使用提示
    console.log(`\r\n 项目【${chalk.cyan(this.name)}】创建成功，请按照以下方式运行`);
    console.log(`\r\n  第一步： cd ${chalk.cyan(this.name)}`);
    console.log("  第二步：npm install");
    console.log("  第三部：npm run serve\r\n");
  }
  // 获取模板信息及用户选择的模板
  async getRepoInfo() {
    // 获取组织下的仓库信息
    let repoList = await loading(
      "正在拉取远程模板...",
      getZhuRongRepo
    );
    if (!repoList) return;
    // 提取仓库名
    const repos = repoList.map((item) => item.name); // [ 'vue-template', 'vue3.0-template' ]
    // 选取模板信息
    let { repo } = await new inquirer.prompt([
      {
        name: "repo",
        type: "list",
        message: "请选择一个模板，创建项目",
        choices: repos,
      },
    ]);
    return repo;
  }
  // 获取版本信息及用户选择的版本
  async getTagInfo(repo) {
    let tagList = await loading(
      "正在拉取版本信息...",
      getTagsByRepo,
      repo
    );
    if (!tagList) return;
    const tags = tagList.map((item) => item.name);
    // 选取模板信息
    let { tag } = await new inquirer.prompt([
      {
        name: "tag",
        type: "list",
        message: "请选择版本创建项目",
        choices: tags,
      },
    ]);
    return tag;
  }
  // 下载git仓库
  async download(repo, tag) {
    // 模板下载地址
    const templateUrl = `zhurong-cli/${repo}${tag ? "#" + tag : ""}`;
    // 调用 downloadGitRepo 方法将对应模板下载到指定目录
    await loading(
      "下载中模板项目中, 请稍后",
      this.downloadGitRepo,
      templateUrl, // 仓库地址  ，  zhurong-cli/vue-template#v2.0
      path.resolve(process.cwd(), this.target) // 项目创建位置 ，/Volumes/Data/进击的巨人/track-cli/test
    );
  }
}

module.exports = Creator;
