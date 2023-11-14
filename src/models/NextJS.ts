export interface PageProps<TParams = any> {
  params: TParams;
  searchParams: { [key: string]: string | string[] | undefined };
}
