# GitHub 仓库维护指南

## 概述
本文档说明了 LinguaVoyage 项目的 GitHub 仓库维护流程和注意事项。

## 推送权限说明
- **主要维护者**: Neo (g29times)
- **协作开发**: MGX 团队通过本平台进行代码开发
- **推送流程**: MGX 团队负责代码开发，Neo 负责最终的 GitHub 推送

## SSH 密钥配置流程

### 场景：SSH 认证失败或密钥丢失

当遇到以下错误时需要重新配置 SSH 密钥：
```
Host key verification failed.
fatal: Could not read from remote repository.
```
或
```
git@github.com: Permission denied (publickey).
```

### 解决步骤

#### 1. 生成新的 SSH 密钥对
```bash
cd /workspace/shadcn-ui
ssh-keygen -t rsa -b 4096 -C "linguavoyage@mgx.com" -f ~/.ssh/linguavoyage_rsa -N ""
```

#### 2. 设置正确的文件权限
```bash
chmod 600 ~/.ssh/linguavoyage_rsa
chmod 644 ~/.ssh/linguavoyage_rsa.pub
```

#### 3. 获取公钥内容
```bash
cat ~/.ssh/linguavoyage_rsa.pub
```

#### 4. 配置 SSH 客户端
创建或更新 SSH 配置文件：
```bash
cat >> ~/.ssh/config << EOF
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/linguavoyage_rsa
    IdentitiesOnly yes
EOF
```

#### 5. 将公钥添加到 GitHub
1. 复制步骤3输出的完整公钥内容
2. 登录 GitHub 账户 (g29times)
3. 前往 Settings → SSH and GPG keys
4. 点击 "New SSH key"
5. 粘贴公钥内容，设置标题为 "LinguaVoyage MGX Platform"
6. 保存

#### 6. 测试 SSH 连接
```bash
ssh -T git@github.com
```
应该看到类似输出：
```
Hi g29times! You've successfully authenticated, but GitHub does not provide shell access.
```

#### 7. 配置 Git 远程仓库
```bash
git remote set-url origin git@github.com:g29times/LinguaVoyage.git
```

#### 8. 推送代码
```bash
git push origin main
```

## 日常推送流程

### 1. 检查状态
```bash
cd /workspace/shadcn-ui
git status
git branch
```

### 2. 添加和提交更改
```bash
git add .
git commit -m "描述性的提交信息"
```

### 3. 推送到 GitHub
```bash
git push origin main
```

## 故障排除

### 问题1：Permission denied (publickey)
**解决方案**: 按照上述 SSH 密钥配置流程重新生成和配置密钥

### 问题2：Host key verification failed
**解决方案**: 
```bash
ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
```

### 问题3：could not read Username for 'https://github.com'
**解决方案**: 切换到 SSH 方式
```bash
git remote set-url origin git@github.com:g29times/LinguaVoyage.git
```

### 问题4：分支落后远程仓库
```bash
git pull origin main --rebase
git push origin main
```

## 最佳实践

1. **提交信息规范**:
   - feat: 新功能
   - fix: 修复问题  
   - docs: 文档更新
   - style: 代码格式调整
   - refactor: 代码重构
   - test: 测试相关
   - chore: 构建工具或依赖更新

2. **推送前检查**:
   - 确保代码可以正常编译运行
   - 检查是否有敏感信息（密钥、密码等）
   - 验证 .gitignore 文件是否正确

3. **分支管理**:
   - main 分支用于生产环境
   - 重大更新可考虑创建功能分支

## 联系方式
如遇到无法解决的 Git/GitHub 问题，请联系主要维护者 Neo。

---
*最后更新: 2025-08-16*