import htmlmin from "html-minifier";
import path from "node:path";
import * as sass from "sass";
import CleanCSS from "clean-css";


const htmlMinifierFn = (content, outputPath) => {
  if (outputPath && outputPath.endsWith(".html")) {
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
    });
    return minified;
  }
  return content;
}

export default async (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy("src/assets/img");

  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");

  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",

    // opt-out of Eleventy Layouts
    useLayouts: false,

    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      // Don’t compile file names that start with an underscore
      if (parsed.name.startsWith("_")) {
        return;
      }

      let result = sass.compileString(inputContent, {
        loadPaths: [
          parsed.dir || ".",
          this.config.dir.includes,
        ]
      });

      // Map dependencies for incremental builds
      this.addDependencies(inputPath, result.loadedUrls);

      return async (data) => {
        return result.css;
      };
    },
  });

  eleventyConfig.addTransform("htmlmin", htmlMinifierFn);
  eleventyConfig.addFilter("cssmin", (code) => {
		return new CleanCSS({}).minify(code).styles;
	});

  return {
    dir: {
      input: "src",
      data: "_data"
    }
  }
};