# dsh-chinese-reasoning

让 DeepSeek Harness 中的模型**始终用简体中文进行内部推理（思考链 / reasoning）**。

这是一个 Host-only 的 DSH 插件 bundle：向系统提示注册一条位于末尾的 `## 推理语言` 规则，不改变最终回答的语言，也不翻译代码、命令、路径、标识符或引用原文。

> 说明：推理语言只能通过提示词引导，不是 API 层的硬性开关。绝大多数情况下模型会遵守；极少数情况下仍可能夹带英文思考。

## 工作原理

- 通过 `ctx.systemPrompt.section()` 注册全局 section，名称为 `local:chinese-reasoning`。
- 排序值 `10250`，位于工具说明、策略段和部署 persona 之后，尽量靠近请求末尾。
- 规则只约束内部推理；最终回答语言仍由用户和任务决定。

注入的提示词（可在 [`index.js`](./index.js) 中修改）：

```text
## 推理语言

进行内部推理（reasoning / 思考链）时，请使用简体中文。即使问题、代码、日志或工具输出是英文，也请用简体中文思考。
代码、命令、路径、标识符、API 名称以及引用的原文保持原样，不要翻译。
这只影响内部推理；最终回答使用哪种语言，仍按用户和任务的要求。
```

## 安装

### 从本地目录安装

```bash
git clone https://github.com/Fyxchl/dsh-chinese-reasoning.git
```

然后在 DSH 中安装该目录作为插件 bundle（`plugin_manager` 的 `install_bundle`，`target` 指向克隆后的绝对路径）。安装后 bundle 会链接进当前 profile，重启后仍然生效。

### 打开桌面端 → 侧栏 插件 → 添加插件，把地址粘进输入框 → 点 安装

`plugin_manager` 的 `target` 接受安装 spec，部分版本可用：

```text
github:Fyxchl/dsh-chinese-reasoning
```

若不支持，请使用上面的本地目录方式。

## 卸载 / 停用

- 在 DSH 的 Plugins 页面停用或移除 `Chinese Reasoning`；
- 或使用 `plugin_manager`：`set_bundle` 关闭，`remove_bundle` 卸载。

## 验证是否生效

1. 安装后发一条任意消息；
2. 展开回答的思考链，内容应为简体中文；
3. 会话日志中应出现 `system/message`，且包含 `## 推理语言` 一节。

## 配置

当前版本没有 Config schema；`apply` 会读取行配置中的可选字段：

```yaml
- id: chinese-reasoning
  name: '@local/chinese-reasoning'
  config:
    language: 简体中文   # 可选，默认简体中文
    order: 10250        # 可选，section 排序
```

## 目录结构

```text
index.js           # Host 插件：注册系统提示 section
cordis.patch.yml   # bundle patch：插入 chinese-reasoning 行
package.json       # bundle manifest
locale/zh.json     # 插件列表显示名（中文）
locale/en.json     # 插件列表显示名（英文）
icon.svg           # 插件图标
```

## 兼容性

- 依赖 `ctx.systemPrompt` 服务（DSH 标准组件）。
- 如果当前 Agent 使用 `complete: true` 的完整 persona，会替换整个系统提示，此时本插件无法生效。

## License

MIT，见 [LICENSE](./LICENSE)。
