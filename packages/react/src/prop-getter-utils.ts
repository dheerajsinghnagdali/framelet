import type { CSSProperties, Ref } from 'react';

export interface AnatomyAttributes {
  'data-scope': string;
  'data-part': string;
}

export type PropGetter<P> = (props?: P) => P & AnatomyAttributes;

type UnknownProps = Record<string, unknown>;
type EventHandler = (...args: unknown[]) => unknown;

function isHandler(key: string): boolean {
  return /^on[A-Z]/.test(key);
}

export function composeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> | undefined {
  const present = refs.filter((ref): ref is Ref<T> => ref !== undefined);
  if (present.length === 0) return undefined;
  if (present.length === 1) return present[0];

  return (node) => {
    for (const ref of present) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}

function chainEventHandlers(user: EventHandler, internal: EventHandler): EventHandler {
  return (...args: unknown[]) => {
    user(...args);
    const event = args[0] as { defaultPrevented?: boolean } | undefined;
    if (event?.defaultPrevented) return;
    internal(...args);
  };
}

export function mergeProps(
  anatomy: AnatomyAttributes,
  internal: object,
  user?: object,
): UnknownProps {
  const internalProps = internal as UnknownProps;
  const result: UnknownProps = { ...anatomy, ...internalProps };

  for (const [key, value] of Object.entries(user ?? {})) {
    if (value === undefined) continue;

    if (key === 'className') {
      result.className = [result.className, value].filter(Boolean).join(' ');
    } else if (key === 'style') {
      result.style = {
        ...(result.style as CSSProperties | undefined),
        ...(value as CSSProperties),
      };
    } else if (key === 'ref') {
      result.ref = composeRefs(result.ref as Ref<unknown> | undefined, value as Ref<unknown>);
    } else if (isHandler(key) && typeof value === 'function') {
      const internalHandler = internalProps[key];
      result[key] =
        typeof internalHandler === 'function'
          ? chainEventHandlers(value as EventHandler, internalHandler as EventHandler)
          : value;
    } else {
      result[key] = value;
    }
  }

  return result;
}
