# GitHub 仓库维护文档

## 📍 仓库信息
**GitHub仓库地址：** https://github.com/g29times/LinguaVoyage

## 🔑 SSH密钥管理策略

### 🚨 已知问题
**系统重启会删除SSH密钥文件**，导致每次都需要重新生成密钥。这是系统限制，暂时只能这样处理。

### ✅ 标准密钥生成流程
1. **David生成SSH密钥：**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "linguavoyage@mgx.com" -f ~/.ssh/linguavoyage_rsa
   ```

2. **获取公钥内容：**
   ```bash
   cat ~/.ssh/linguavoyage_rsa.pub
   ```

3. **用户Neo在GitHub配置：**
   - 登录GitHub → Settings → SSH and GPG keys
   - 添加新的SSH公钥
   - 将David生成的公钥内容粘贴进去

## 🔄 GitHub推送流程

### ✅ 正确推送步骤
```bash
cd /workspace/shadcn-ui
git add .
git commit -m "描述性提交信息"
git push origin main
```

### 🚨 常见错误及解决方案

#### 错误1：HTTPS认证问题
**错误信息：** `fatal: could not read Username for 'https://github.com': No such device or address`

**解决方案：** 将远程仓库URL改为SSH格式
```bash
git remote set-url origin git@github.com:g29times/LinguaVoyage.git
```

#### 错误2：过度测试SSH连接
**问题：** 认证成功后还在反复执行 `ssh -T git@github.com`

**正确做法：** 看到成功提示后直接推送
```
Hi g29times! You've successfully authenticated, but GitHub does not provide shell access.
```
**看到此提示 = SSH认证成功，立即执行推送！**

#### 错误3：推送到错误分支
**正确做法：** 确保推送到main分支
```bash
git push origin main
```

## 📋 推送前检查清单

### 必要步骤：
- [ ] 确认SSH密钥已生成且在GitHub配置
- [ ] 确认远程仓库URL为SSH格式
- [ ] 执行 `git status` 检查文件状态
- [ ] 执行 `git add .` 添加所有更改
- [ ] 执行 `git commit -m "描述性信息"` 提交更改
- [ ] 执行 `git push origin main` 推送到GitHub

### 成功标志：
- 看到类似输出：`To github.com:g29times/LinguaVoyage.git`
- 显示提交hash变化：`0f0f66c..ede3953  main -> main`

## 🛠️ 故障排除

### SSH连接测试（仅在必要时使用）
```bash
ssh -T git@github.com
```
**注意：** 认证成功后不要反复测试，直接推送！

### 查看远程仓库配置
```bash
git remote -v
```

### 查看当前状态
```bash
git status
git log --oneline -5
```

## 📝 维护责任说明

### David（开发者）职责：
1. 生成SSH密钥对
2. 提供公钥给用户配置
3. 执行代码推送操作
4. 维护代码质量和文档

### Neo（仓库所有者）职责：
1. 在GitHub配置SSH公钥
2. 管理仓库权限和设置
3. 确保GitHub仓库可访问性

## 🎯 经验总结

### 关键教训：
1. **系统重启必然导致SSH密钥丢失** - 这是已知限制
2. **SSH认证成功后立即推送** - 不要过度测试
3. **使用SSH而非HTTPS** - 避免认证问题
4. **保持流程简洁** - 认证→推送，不要中间测试

### 成功模式：
```bash
# 一次性成功推送的完整流程
cd /workspace/shadcn-ui
git remote set-url origin git@github.com:g29times/LinguaVoyage.git
git add .
git commit -m "具体的更改描述"
git push origin main
```

**遵循此文档可确保GitHub推送一次性成功！** 🚀