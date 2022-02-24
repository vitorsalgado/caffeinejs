import { tokenStr } from '../../Token.js'
import { Container } from '../../Container.js'

export function containerToString(container: Container): string {
  return (
    `${container.constructor.name}(namespace=${String(container.namespace)}, count=${container.size}) {` +
    '\n' +
    Array.from(container.entries())
      .map(
        ([token, binding]) =>
          `${tokenStr(token)}: ` +
          `names=[${binding.names?.map(x => tokenStr(x)).join(', ')}], ` +
          `scope=${binding.scopeId.toString()}, ` +
          `injections=[${binding.injections
            ?.map(
              spec =>
                '[' +
                tokenStr(spec.token) +
                (spec.tokenType ? ` : ${tokenStr(spec.tokenType)}` : '') +
                `: optional=${spec.optional || false}, multiple=${spec.multiple || false}]`,
            )
            .join(', ')}], ` +
          `lazy=${binding.lazy}, ` +
          `provider=${binding.rawProvider?.constructor?.name}`,
      )
      .join('\n, ') +
    '\n}'
  )
}
