
export function getSignalName(namespace: string | undefined, type: string) {
  return namespace ? `${namespace}:${type}` : type;
}

