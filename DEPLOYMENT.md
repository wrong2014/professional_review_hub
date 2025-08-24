# 部署说明文档

## GitHub Pages 自动部署

这个项目配置了 GitHub Actions 工作流，可以自动构建并部署到 GitHub Pages。

### 自动部署流程

1. **触发条件**：
   - 当代码推送到 `main` 分支时
   - 当创建针对 `main` 分支的 Pull Request 时

2. **构建步骤**：
   - 使用 Node.js 20 和 pnpm 10.5.0
   - 安装项目依赖
   - 执行 `pnpm build` 构建项目
   - 上传构建产物到 GitHub Pages

3. **部署步骤**：
   - 自动部署到 GitHub Pages
   - 可通过 `https://wrong2014.github.io/professional_review_hub/` 访问

### 手动启用 GitHub Pages

如果这是第一次部署，需要在 GitHub 仓库中手动启用 GitHub Pages：

1. 进入仓库设置页面：`https://github.com/wrong2014/professional_review_hub/settings`
2. 滚动到 "Pages" 部分
3. 在 "Source" 下拉菜单中选择 "GitHub Actions"
4. 保存设置

### 本地构建测试

在推送到仓库之前，可以本地测试构建：

```bash
# 开发环境构建
pnpm build

# 生产环境构建（用于 GitHub Pages）
pnpm build --mode prod

# 预览构建结果
pnpm preview
```

### 环境配置

项目包含以下环境配置文件：

- `.env` - 开发环境默认配置
- `.env.prod` - 生产环境配置（用于 GitHub Pages）
- `.env.test` - 测试环境配置

### 项目特色

🏛️ **职称标准化评审系统**
- 政府门户风格设计
- 支持 8 种系统角色
- 双重登录方式（密码 + 短信验证）
- 响应式布局设计
- 通知公告和政策文件管理
- 智能搜索功能

### 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite 7
- **UI 组件库**: Naive UI
- **样式方案**: UnoCSS + SCSS
- **状态管理**: Pinia
- **路由**: Vue Router + Elegant Router
- **图标**: Iconify
- **部署**: GitHub Actions + GitHub Pages

### 访问地址

- **生产环境**: https://wrong2014.github.io/professional_review_hub/
- **开发环境**: http://localhost:9527

### 联系信息

如有问题或建议，请通过以下方式联系：

- GitHub Issues: https://github.com/wrong2014/professional_review_hub/issues
- 项目维护者: wrong2014