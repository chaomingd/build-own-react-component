export function treeFind<T extends any = any>(treeData: T[], callback: (item: T, index: number, parent: T | null, localIndex: number, level: number) => boolean, options?: {
  childrenName?: string;
}) {
  let node:T|null = null
  let index = 0
  const childrenName = options?.childrenName || 'children'
  const walk = (treeData: T[], level = 0, parent: T | null = null) => {
    for(let i = 0; i < treeData.length; i++){
      const item = treeData[i]
      if(callback(item, index, parent, i, level)){
        node = item
        break
      }
      index++
      if (item[childrenName] && item[childrenName].length) {
        walk(item[childrenName], level + 1, item)
      }
    }
  }
  walk(treeData)
  return node;
}