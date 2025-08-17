# GitHub Repository Maintenance

## 仓库维护说明

**重要：GitHub仓库由开发团队维护，而不是用户(Neo)维护**

### 仓库信息
- **仓库地址：** https://github.com/g29times/LinguaVoyage
- **维护者：** David/Alex (开发团队成员)
- **用户权限：** Neo/用户没有控制台权限，无需参与推送操作

### SSH配置状态
✅ SSH私钥已配置  
✅ 远程仓库地址已设置  
✅ 推送权限已验证  

### 标准推送流程
当需要推送代码时，开发团队成员应执行：

```bash
cd /workspace/shadcn-ui
git remote -v          # 验证远程仓库配置
git status             # 检查文件状态
git add .              # 添加所有更改
git commit -m "描述性提交信息"
git push               # 推送到GitHub
```

### 历史记录
- **初次配置：** 用户已完成SSH私钥和远程仓库的初始配置
- **推送权限：** 开发团队有完整的推送权限
- **维护责任：** 代码推送和仓库维护由团队负责

### 注意事项
- 用户不需要参与推送操作
- 所有GitHub相关操作由开发团队处理
- 保持这个文档更新以避免角色混淆

---
*文档创建日期：2025-08-16*  
*最后更新：推送流程说明和权限澄清*