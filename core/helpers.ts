/**
 * @description Get the host part of a given URL
 *
 * @param url Url from which to generate the base path from
 */
export const host = (url: string) => {
  if (url) {
    const url_ = new URL(url);
    url = `${url_.protocol}//${url_.host}`;
    return `${`${url.endsWith("/") ? url.slice(0, -1) : url}`}`;
  }
  return url ?? "";
};
