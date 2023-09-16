const path = require("path");
const fs = require("fs-extra");
const Inquirer = require("inquirer"); // 询问
const Creator = require("./Creator");
const { loading } = require("./util");
// 接收到项目名称 和 路径
module.exports = async function (projectName, options) {
  // 获取当前工作目录
  const cwd = process.cwd();
  const targetDirectory = path.join(cwd, projectName);
  // 判断同名目录
  if (fs.existsSync(targetDirectory)) {
    if (options.force) {
      // 删除重名目录
      await fs.remove(targetDirectory);
    } else {
      let { isOverwrite } = await new Inquirer.prompt([
        // 返回值为promise
        {
          name: "isOverwrite", // 与返回值对应
          type: "list", // list 类型
          message: "项目名重复，请选择是否覆盖",
          choices: [
            { name: "覆盖", value: true },
            { name: "取消", value: false },
          ],
        },
      ]);
      if (!isOverwrite) {
        console.log("取消");
        return;
      } else {
        await loading(
          `Removing ${projectName}, please wait a minute`,
          fs.remove,
          targetDirectory
        );
      }
    }
  }

  // 创建项目
  const creator = new Creator(projectName, targetDirectory);

  creator.create();
};
