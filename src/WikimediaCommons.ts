import { resolve } from "dns";
import { rejects } from "assert";

const fetch = this.fetch || require("node-fetch");

export type ImageResource = {
  maxSize: { width: number; height: number };
  urlTemplate: UrlTemplate;
};

type UrlTemplate = { prefix: string; suffix: string };

type ApiResponse = {
  query: {
    pages: { [key in number]: { imageinfo: Array<ApiResponseImageInfo> } };
  };
};

type ApiResponseImageInfo = { width: number; height: number; thumburl: string };

const parseResponse = (input: ApiResponse): Array<ImageResource> => {
  const results: Array<ImageResource> = [];

  Object.values(input.query.pages).forEach(({ imageinfo }) =>
    imageinfo.forEach(({ width, height, thumburl }) => {
      const urlTemplate = parseUrl(thumburl);

      if (!urlTemplate) return;
      results.push({
        urlTemplate,
        maxSize: { width: width - 1, height: height - 1 }
      });
    })
  );

  return results;
};

const parseUrl = (input: string): UrlTemplate | null => {
  try {
    const matchResult = input.match(/^(.*\/)[0-9]+(px-.*)$/);
    const [_, prefix, suffix] = matchResult || [];
    if (!prefix || !suffix) return null;
    return { prefix, suffix };
  } catch (e) {
    return null;
  }
};

const mkUrl = (options: { limit: number }): string =>
  "https://commons.wikimedia.org" +
  "/w/api.php" +
  "?origin=*&action=query" +
  "&format=json" +
  "&prop=imageinfo" +
  "&iiprop=url|size|sha1" +
  "&generator=random" +
  "&iiurlwidth=100" +
  "&grnnamespace=6" +
  `&grnlimit=${options.limit}`;

export const getRandomImageResources = (options: {
  limit: number;
}): Promise<Array<ImageResource>> =>
  fetch(mkUrl(options))
    .then(x => x.json())
    .then(x => Promise.resolve(parseResponse(x)));

const resolveUrlTemplate = (
  width: number,
  { prefix, suffix }: UrlTemplate
): string => `${prefix}${width}${suffix}`;

export const toUrl = (
  width: number,
  imageResource: ImageResource
): null | string => {
  if (width > imageResource.maxSize.width) return null;
  return resolveUrlTemplate(width, imageResource.urlTemplate);
};
