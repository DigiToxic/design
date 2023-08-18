import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import cheerio from "cheerio";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { url1, url2 } = req.body;
  console.log("Received URLs:", url1, url2);

  const [response1, response2] = await Promise.all([
    axios.get(url1),
    axios.get(url2),
  ]);

  console.log(
    "Fetched content lengths:",
    response1.data.length,
    response2.data.length
  );

  const $1 = cheerio.load(response1.data);
  const $2 = cheerio.load(response2.data);

  const structureScore = compareStructures($1, $2);
  console.log("Structure score:", structureScore);

  const styleScore = compareStyles($1, $2);
  console.log("Style score:", styleScore);

  const similarity = (structureScore + styleScore) / 2;
  console.log("Similarity score:", similarity);

  res.json({ similarity });
}

function generateStructureArray(
  $: cheerio.Root,
  element: cheerio.Element
): string[] {
  const children = $(element).children();
  if (element.type !== "tag") return [];
  const structure: string[] = [element.name];
  children.each((_, child) => {
    structure.push(...generateStructureArray($, child));
  });
  return structure;
}

function compareStructures($1: cheerio.Root, $2: cheerio.Root): number {
  const structure1 = generateStructureArray($1, $1('html')[0]);
  const structure2 = generateStructureArray($2, $2('html')[0]);

  console.log("Structure 1:", structure1);
  console.log("Structure 2:", structure2);

  const totalElements = Math.max(structure1.length, structure2.length);
  if (totalElements === 0) {
    return 0; 
  }

  let matchedElements = 0;
  for (const tag1 of structure1) {
    const indexInStructure2 = structure2.indexOf(tag1);
    if (indexInStructure2 > -1) {
      matchedElements++;
      structure2.splice(indexInStructure2, 1); // Remove the matched element
    }
  }

  console.log("Matched Elements:", matchedElements);

  return (matchedElements / totalElements) * 100;
}


function compareStyles($1: cheerio.Root, $2: cheerio.Root): number {
  const style1 = extractElementStyles($1);
  const style2 = extractElementStyles($2);

  const totalStyles = Math.max(style1.length, style2.length);
  const matchedStyles = style1.filter(
    (value, index) => style2[index] === value
  ).length;

  return (matchedStyles / totalStyles) * 100;
}

function extractElementStyles($: cheerio.Root): string[] {
  let styles: string[] = [];
  $("*").each((_, elem) => {
    if (elem.type === "tag") {
      const tagStyle = $(elem).attr("style") || "";
      styles.push(`${elem.name}:{${tagStyle}}`);
    }
  });
  return styles;
}
