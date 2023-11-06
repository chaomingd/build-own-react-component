declare module '*.module.less' {
  const resource: { [key: string]: string };
  export = resource;
}

declare module '*.less' {
  const resource: string;
  export default resource;
}