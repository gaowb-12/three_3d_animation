import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            RuleConfigSeverity.Error,
            "always",
            [
                "feat", // 新特性、新功能
                "fix", // 修改bug
                "perform", // 优化相关，比如提升性能、体验
                "refactor", // 代码重构
                "revert", // 回滚到上一个版本
                "test", // 测试用例修改
                "build", // 编译相关的修改，例如发布版本、对项目构建或者依赖的改动
                "chore", // 其他修改, 比如改变构建流程、或者增加依赖库、工具等
                "ci", // 持续集成修改
                "docs", // 文档修改
            ],
        ],
    },
};
export default Configuration;
