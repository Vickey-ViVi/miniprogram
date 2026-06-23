# 万象智慧助手 · 微信小程序

万象城智慧导购与服务小程序，面向到店顾客提供 **AI 智能提问、店铺推荐、路线规划、投诉求助、品牌入驻提议** 等一站式逛店体验。前端与 Spring Boot 后端 `smart-concierge` 联调，数据同步至 PC 企业管理后台。

---

## 项目特点

### 🤖 AI 智能导购

- **分步引导**：先选咨询类型（美食 / 玩乐 / 购物 / 路线），再选同行人数，进入自由对话
- **Deepseek 驱动**：配置 API Key 后，自由问答与店铺推荐由 Deepseek 生成个性化回复
- **个性化推荐理由**：结合顾客对话内容，为每家店铺生成不同的推荐理由（非模板话术）
- **会话保持**：推荐结果页「继续提问」可恢复此前对话记录，无需从头开始
- **随时改类型**：支持「重新选择提问类型」，灵活切换咨询场景

### 🗺️ 智慧逛店路线

- **双模式规划**：勾选店铺，或用自然语言描述想去的店
- **偏好设置**：总时长限制、婴儿车、轮椅无障碍等选项
- **AI 规划理由**：Deepseek 生成整体路线说明及各站点 visit 提示
- **一键串联**：从推荐结果页可直接带入已选店铺进入路线规划

### 📢 服务闭环 · 投诉与求助

- 支持空调、卫生、失物等多类型工单提交
- 提交后生成工单记录，同步至 PC 端客服后台处理
- 「我的」页可查看本地投诉历史

### 🛍️ 店铺入驻提议

- 顾客提议希望入驻的品牌，并填写**推荐理由**
- 热门提议榜展示高人气品牌，支持点赞支持
- 提议明细写入数据库，招商人员在 PC 后台查看与分析

### 👤 个人中心

- 推荐历史、投诉历史本地留存
- 快捷入口：智能提问、投诉、入驻提议、路线规划

### 🎨 产品体验

- 万象城品牌色（深蓝 + 金色）统一视觉
- 首页卡片式功能入口，信息层次清晰
- 聊天气泡左右对称圆角，交互符合微信习惯
- TabBar：首页 / 我的，结构简洁

---

## 功能模块一览

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `pages/index` | 三大功能入口 |
| 智能提问 | `pages/chat` | 对话 + 获取推荐 |
| 推荐结果 | `pages/recommend-result` | 店铺列表与 AI 推荐理由 |
| 路线规划 | `pages/route-plan` | 选店 / 描述路线 + 规划结果 |
| 投诉求助 | `pages/complaint` | 提交服务工单 |
| 入驻提议 | `pages/proposal` | 品牌提议 + 热门榜 |
| 我的 | `pages/member` | 历史记录与快捷入口 |

---

## 技术栈

- **平台**：微信小程序原生开发（WXML / WXSS / JavaScript）
- **基础库**：见 `project.config.json` 中 `libVersion`
- **网络**：`wx.request` 封装于 `utils/api.js`
- **本地存储**：`utils/storage.js`（推荐历史、投诉历史、聊天会话）

---

## 目录结构

```
miniprogram-1/
├── app.js / app.json / app.wxss    # 小程序入口与全局配置
├── pages/
│   ├── index/                      # 首页
│   ├── chat/                       # 智能提问
│   ├── recommend-result/           # 推荐结果
│   ├── route-plan/                 # 路线规划
│   ├── complaint/                  # 投诉求助
│   ├── proposal/                   # 入驻提议
│   └── member/                     # 我的
├── utils/
│   ├── api.js                      # 后端 API 封装
│   ├── storage.js                  # 本地存储
│   └── util.js                     # 工具函数
└── project.config.json             # 开发者工具项目配置
```

---

## 后端联调

### 1. 启动后端

在 `smart-concierge` 项目中启动 Spring Boot 服务，默认端口 **8080**。

### 2. 配置 API 地址

编辑 `utils/api.js`：

```javascript
const BASE_URL = 'http://localhost:8080/api';
```

真机调试时需改为可访问的服务器地址，并在微信开发者工具中勾选 **不校验合法域名**（开发阶段）。

### 3. 主要接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `/chat/converse` | POST | 智能提问自由对话 |
| `/chat/recommend` | POST | 获取店铺推荐 |
| `/shops/list` | GET | 店铺列表 |
| `/route/generate` | POST | 生成逛店路线 |
| `/complaint/submit` | POST | 提交投诉 |
| `/proposal/add` | POST | 提交品牌提议 |
| `/proposal/hot` | GET | 热门提议榜 |
| `/proposal/like` | POST | 点赞支持品牌 |

---

## 本地运行

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本项目目录 `miniprogram-1`
3. 确认 AppID（见 `project.config.json`）或使用测试号
4. 启动后端 `smart-concierge`，编译并预览小程序
5. 开发阶段在「详情 → 本地设置」中开启 **不校验合法域名、web-view、TLS 版本**

---

## 与 PC 管理端的关系

| 小程序行为 | PC 后台模块 |
|-----------|------------|
| 智能提问 / 推荐 | 推荐记录、系统监控（Deepseek） |
| 投诉提交 | 工单管理 |
| 品牌提议 + 理由 | 入驻提议管理 · 提议明细 |
| 店铺 / 活动数据 | 店铺管理、活动管理（运营维护） |

---

## 相关项目

- **后端**：`smart-concierge` — Spring Boot + MySQL
- **PC 管理端**：`smart-concierge\admin-web` — Vue 3 + Element Plus

---

## 说明

- Deepseek 需在服务端配置 API Key 并保证账户余额，否则智能推荐将使用规则兜底
- 聊天会话、部分历史记录保存在小程序本地，清除缓存后会丢失
- 生产环境部署前请将 `BASE_URL` 改为 HTTPS 域名，并在微信公众平台配置 request 合法域名
