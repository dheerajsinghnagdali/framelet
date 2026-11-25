import { source } from '@/lib/source';
import { Logo } from '@/components/logo';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { DocsPage, DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';

function getPackageLabel(slugs: string[]): string | undefined {
  const slug = slugs[0];
  const roots = [...source.pageTree.children, ...(source.pageTree.fallback?.children ?? [])];
  const root = roots.find(
    (node) =>
      node.type === 'folder' &&
      node.root &&
      (node.index?.url === `/docs/${slug}` || node.$ref?.folder === slug),
  );

  return typeof root?.name === 'string' ? `Framelet ${root.name}` : undefined;
}

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  if (!params.slug || params.slug.length === 0) {
    redirect('/docs/react');
  }
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsLayout
      tree={source.pageTree}
      tabs={{
        transform: (option: LayoutTab): LayoutTab => ({
          ...option,
          title: <>Framelet {option.title}</>,
          unlisted: false,
        }),
      }}
      nav={{ title: <Logo />, url: '/docs' }}
    >
      <DocsPage toc={page.data.toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    </DocsLayout>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const title = `${page.data.title ?? 'Documentation'} | ${getPackageLabel(page.slugs) ?? 'Framelet'}`;

  return {
    title: { absolute: title },
    description: page.data.description,
    openGraph: { title },
    twitter: { title },
  };
}
