export interface AnatomyPart<Name extends string> {
  name: Name;
  selector: string;
  attrs: {
    'data-scope': string;
    'data-part': Name;
  };
}

export interface Anatomy<Scope extends string, Name extends string> {
  scope: Scope;
  parts: readonly Name[];
  build(): Record<Name, AnatomyPart<Name>>;
}

export function createAnatomy<Scope extends string>(scope: Scope) {
  return {
    parts<const Names extends readonly string[]>(...parts: Names): Anatomy<Scope, Names[number]> {
      return {
        scope,
        parts,
        build() {
          return Object.fromEntries(
            parts.map((part) => [
              part,
              {
                name: part,
                selector: `[data-scope="${scope}"][data-part="${part}"]`,
                attrs: {
                  'data-scope': scope,
                  'data-part': part,
                },
              },
            ]),
          ) as unknown as Record<Names[number], AnatomyPart<Names[number]>>;
        },
      };
    },
  };
}

export const frameletAnatomy = createAnatomy('framelet').parts(
  'root',
  'viewport',
  'canvas',
  'drop-indicator',
  'empty-state',
  'controls',
  'file-input',
  'upload-trigger',
  'crop-trigger',
  'apply-crop-trigger',
  'cancel-crop-trigger',
  'rotate-trigger',
  'flip-horizontal-trigger',
  'flip-vertical-trigger',
  'undo-trigger',
  'redo-trigger',
  'reset-trigger',
  'filter-control',
  'filter-select',
  'filter-option',
  'adjustment-list',
  'adjustment-control',
  'adjustment-label',
  'adjustment-slider',
  'adjustment-value',
  'crop-overlay',
  'crop-selection',
  'crop-handle',
);

export const frameletParts = frameletAnatomy.build();
