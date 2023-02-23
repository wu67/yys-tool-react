## yys-tool-react.

just test my react skill here

###

react + recoil + dexie + antd

## step by step

这个项目的只是我学习 react 的产物, 内容包括 ts、API 代理、多环境 build、eslint+prettier, 业务逻辑则是照搬了之前的个人项目 [yys-tool](https://github.com/wu67/yys-tool)

##### why react-script? why not other?

主要是为了尽可能利用官方团队的`react-script`, 而不是其他二次封装`react-script`的工具.

- donenv 是为了配置多个‘环境’, 提供相应的环境变量
- 二次封装工具, 如 Umi/craco, 大多基于 react-script@4 / webpack@4, 要不就是两三年未维护更新, 使用 react-scirpt@5 和 webpack@5 不是更好吗.
- webpack alias 别名目前处于失效状态, 这应该是 react-script 的问题, GitHub 于 2022-02 就有人提出了相应的 issue, 但一直未被修复. 不过有对应的解决方案: 把`src/path/filename` 当成 `@/path/filename`用是可行的, 区别只是 src 需要按 3 个键、@需要 shift+2, 击键耗时其实也差不多.
- react-script 的 eject 严重拉低了从官方更新的可维护性, 升级困难, 不考虑这种方案.

#### config env.local

项目的根目录下`.env.development.local`, 并增加以下内容:

```bash
PUBLIC_URL=""

# and you can config local dev port by add this
PORT=8888

```

#### install

```bash
npm i
```

#### start

```bash
npm run start
# or
npm run dev
```

#### build

```bash
npm run build
```

## use docker

```bash
docker build -t yys_tool_react:dev .
```

```bash
docker run -d -p 8888:8888 -v ${PWD}:/app --name yys_tool_react yys_tool_react:dev
```

