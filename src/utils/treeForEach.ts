export function treeForEach<T extends any = any>(treeData: T[], callback: (item: T, index: number) => void, options?: {
  childrenName?: string;
}) {
  let index = 0
  const childrenName = options?.childrenName || 'children'
  const walk = (treeData: T[], parent: T | null = null) => {
    treeData?.forEach(item => {
      callback(item, index)
      index++
      if (item[childrenName] && item[childrenName].length) {
        walk(item[childrenName], item)
      }
    })
  }
  walk(treeData)
  return index;
}