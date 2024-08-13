import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  BooleanType,
  newParsingContext,
  StringType,
  NoneType,
} from 'ol/expr/expression';
import { buildExpression, newEvaluationContext } from 'ol/expr/cpu';
import { is } from '@vcsuite/check';

/**
 * @typedef {Object} Block
 * @property {RegExpExecArray} opening
 * @property {RegExpExecArray} closing
 */

/**
 * @typedef {Block} ConditionalBlock
 * @property {RegExpExecArray|undefined} elseStatement
 * @property {RegExpExecArray[]} elseIfs
 */

/**
 * @param {string} content
 * @returns {string}
 */
export function parseAndSanitizeMarkdown(content) {
  const html = marked.parse(content, { breaks: true });

  // Then sanitize the HTML using DOMPurify
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

/**
 * @param {string} expressionString
 * @param {Record<string, unknown>} data
 * @param {number} evaluationType
 * @returns {*}
 */
function evaluateExpression(expressionString, data, evaluationType) {
  const parsed = expressionString.startsWith('[')
    ? JSON.parse(expressionString)
    : [
        'get',
        ...expressionString
          .replace(/\[([^\]]+)]/g, '.$1')
          .split('.')
          .filter((f) => f),
      ];

  const compiledExpression = buildExpression(
    parsed,
    evaluationType,
    newParsingContext(),
  );
  const evaluationContext = newEvaluationContext();
  evaluationContext.properties = data;
  return compiledExpression(evaluationContext);
}

/**
 * Replaces template strings by provided attributes, e.g. {{myAttribute}}
 * @param {string} template
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
function replaceAttributes(template, data) {
  const pattern = /\{\{([^}]+)}}/g;
  return template.replace(pattern, (p, value) => {
    return evaluateExpression(value.trim(), data, StringType) ?? '';
  });
}

/**
 * @param {RegExp} regexp
 * @param {string} string
 * @returns {RegExpExecArray[]}
 */
function regexHits(regexp, string) {
  const hits = [];
  let hit;
  // eslint-disable-next-line no-cond-assign
  while ((hit = regexp.exec(string))) {
    hits.push(hit);
  }

  return hits;
}

/**
 * @param {RegExpExecArray[]} openings
 * @param {RegExpExecArray[]} closings
 * @param {(Block) => void} accepted
 * @param {(Block) => void} rejected
 * @returns {void}
 */
function findTopLevelBlock(openings, closings, accepted, rejected) {
  const localOpenings = openings.slice();
  const localClosings = closings.slice();
  while (localOpenings.length > 0) {
    let matchingClosing;
    let matchingOpening;
    while (!matchingClosing && localClosings.length > 0) {
      const currentClosing = localClosings.shift();
      const openingDistances = localOpenings.map(
        (o) => currentClosing.index - o.index,
      );
      const minDistance = openingDistances.reduce((min, currentDistance) => {
        if (currentDistance > 0 && currentDistance < min) {
          return currentDistance;
        }
        return min;
      }, Infinity);
      const matchingOpeningIndex = openingDistances.indexOf(minDistance);
      matchingOpening = localOpenings[matchingOpeningIndex];

      if (matchingOpeningIndex === 0) {
        matchingClosing = currentClosing;
      } else {
        rejected({ opening: matchingOpening, closing: currentClosing });
      }
      localOpenings.splice(matchingOpeningIndex, 1);
    }

    if (matchingClosing) {
      accepted({ opening: matchingOpening, closing: matchingClosing });
    }
  }
}

/**
 * @param {RegExpExecArray} tag
 * @param {Block} block
 * @returns {boolean}
 */
function tagWithinBlock(tag, block) {
  return tag.index > block.opening.index && tag.index < block.closing.index;
}

/**
 * @param {string} template
 * @returns {Block[]}
 */
function getForEachBlocks(template) {
  const forEachBlocks = [];
  const forEachOpenings = regexHits(
    /\s*{{#each\s\(([^.)]+)\)\sin\s([^}]+)}}\s*/g,
    template,
  );
  const forEachClosings = regexHits(/\s*{{\/each}}\s*/g, template);

  if (forEachClosings.length > forEachOpenings.length) {
    throw new Error(
      'Template failed to render, missing opening tag for each statements',
    );
  } else if (forEachClosings.length < forEachOpenings.length) {
    throw new Error(
      'Template failed to render, missing closing tag for each statements',
    );
  }

  findTopLevelBlock(
    forEachOpenings,
    forEachClosings,
    (block) => {
      forEachBlocks.push(block);
    },
    () => {},
  );

  return forEachBlocks;
}

/**
 * @param {string} template
 * @param {Block[]} forEachBlocks
 * @returns {ConditionalBlock[]}
 */
function getConditionalBlocks(template, forEachBlocks) {
  const conditionalBlocks = [];
  let conditionalOpenings = regexHits(/\s*{{#if\s([^}]*)}}\s*/g, template);
  let conditionalClosings = regexHits(/\s*{{\/if}}\s*/g, template);
  let elseIfs = regexHits(/\s*{{elseif\s([^}]*)}}\s*/g, template);
  let elses = regexHits(/\s*{{else}}\s*/g, template);

  const withinForEachBlock = (tag) =>
    forEachBlocks.find((block) => tagWithinBlock(tag, block));

  // conditionals within a for each blocks are rendered with the for each block, ignore
  conditionalOpenings = conditionalOpenings.filter(
    (t) => !withinForEachBlock(t),
  );
  conditionalClosings = conditionalClosings.filter(
    (t) => !withinForEachBlock(t),
  );

  if (conditionalClosings.length > conditionalOpenings.length) {
    throw new Error(
      'Template failed to render, missing closing tag for if statements',
    );
  } else if (conditionalClosings.length < conditionalOpenings.length) {
    throw new Error(
      'Template failed to render, missing opening tag for if statements',
    );
  }

  const filterElseIfElse = (block) => {
    elseIfs = elseIfs.filter((tag) => !tagWithinBlock(tag, block));
    elses = elses.filter((tag) => !tagWithinBlock(tag, block));
  };

  findTopLevelBlock(
    conditionalOpenings,
    conditionalClosings,
    (block) => {
      const elsIfs = elseIfs.filter((tag) => tagWithinBlock(tag, block));
      const elseStatement = elses.find((tag) => tagWithinBlock(tag, block));
      if (
        elseStatement &&
        elsIfs.length > 0 &&
        elseStatement.index < elsIfs.at(-1).index
      ) {
        throw new Error('{{else}} must be the last entry in a block');
      }
      conditionalBlocks.push({
        ...block,
        elseStatement,
        elseIfs,
      });
    },
    (block) => {
      filterElseIfElse(block);
    },
  );

  return conditionalBlocks;
}

/**
 * @param {string} openingTag
 * @returns {boolean}
 */
function shouldRemoveWhiteSpace(openingTag) {
  return /\n\s*\{/.test(openingTag) && /}\s*\n/.test(openingTag);
}

/**
 * This will extract the block to render separately. This will depend on the white space handling. If the
 * opening is placed on its own line, whitespace after the opening and before the closing blocks will be removed
 * from the sub template, up to the first new line feed.
 * @param {string} template
 * @param {Block} block
 * @returns {string}
 */
function getSubTemplateForBlock(template, block) {
  const removeWhiteSpace = shouldRemoveWhiteSpace(block.opening[0]);
  let startIndex = block.opening.index + block.opening[0].indexOf('}') + 2;
  let endIndex = block.closing.index + block.closing[0].indexOf('{');
  if (removeWhiteSpace) {
    startIndex += (/}\s*\n/.exec(block.opening[0])?.[0].length ?? 1) - 1;
    endIndex -= (/\n\s*\{/.exec(block.closing[0])?.[0].length ?? 2) - 2;
  }

  return template.substring(startIndex, endIndex);
}

/**
 * This will replace a block with a previously extracted blocks rendered template.
 * This will depend on the white space handling. If the opening is placed on its own line,
 * whitespace before the opening and after the closing blocks will be removed up to the first new line feed,
 * from the new template string all together.
 * @param {string} template
 * @param {Block} block
 * @param {string} replacement
 * @returns {string}
 */
function replaceBlock(template, block, replacement) {
  const removeWhiteSpace = shouldRemoveWhiteSpace(block.opening[0]);
  let startIndex = block.opening.index + block.opening[0].indexOf('{');
  let endIndex = block.closing.index + block.closing[0].indexOf('}') + 2;
  if (removeWhiteSpace) {
    startIndex -= (/\n\s*\{/.exec(block.opening[0])?.[0].length ?? 2) - 2;
    endIndex += (/}\s*\n/.exec(block.closing[0])?.[0].length ?? 1) - 1;
  }

  return `${template.substring(0, startIndex)}${replacement}${template.substring(endIndex)}`;
}

/**
 * Replaces {{#if }} blocks
 * @param {string} template
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
function expandConditionalsAndLoops(template, data) {
  let renderedTemplate = template;
  const forEachBlocks = getForEachBlocks(template);

  getConditionalBlocks(template, forEachBlocks)
    .reverse()
    .forEach(
      /** @param {ConditionalBlock} block */ (block) => {
        const partialBlocks = [block.opening];
        if (block.elseIfs) {
          partialBlocks.push(...block.elseIfs);
        }
        let trueStatementIndex = partialBlocks.findIndex((s) =>
          evaluateExpression(s[1], data, BooleanType),
        );
        if (trueStatementIndex === -1 && block.elseStatement) {
          trueStatementIndex = partialBlocks.length;
        }

        let renderedBlock = '';
        if (trueStatementIndex > -1) {
          if (block.elseStatement) {
            partialBlocks.push(block.elseStatement);
          }
          partialBlocks.push(block.closing);

          const blockTemplate = getSubTemplateForBlock(template, {
            opening: partialBlocks[trueStatementIndex],
            closing: partialBlocks[trueStatementIndex + 1],
          });

          renderedBlock = expandConditionalsAndLoops(blockTemplate, data);
        }

        renderedTemplate = replaceBlock(renderedTemplate, block, renderedBlock);
      },
    );

  // only iterate over blocks not removed by conditionals
  getForEachBlocks(renderedTemplate)
    .reverse()
    .forEach((block) => {
      const obj = evaluateExpression(block.opening[2], data, NoneType);
      let keyValuePairs;
      if (is(obj, Object)) {
        keyValuePairs = Object.entries(obj);
      } else if (Array.isArray(obj)) {
        keyValuePairs = obj.entries();
      }
      const renderedBlocks = [];
      if (keyValuePairs) {
        let index = 0;
        const [valueName, keyName, indexName] = block.opening[1]
          .split(',')
          .map((e) => e.trim())
          .slice(0, 3);

        const blockTemplate = getSubTemplateForBlock(renderedTemplate, block);
        // eslint-disable-next-line no-restricted-syntax
        for (const args of keyValuePairs) {
          const forEachData = structuredClone(data);
          forEachData[valueName] = args[1];
          if (keyName) {
            forEachData[keyName] = args[0];
          }
          if (indexName) {
            forEachData[indexName] = index;
          }
          const currentBlock = expandConditionalsAndLoops(
            blockTemplate,
            forEachData,
          );
          renderedBlocks.push(replaceAttributes(currentBlock, forEachData));
          index += 1;
        }
      }

      renderedTemplate = replaceBlock(
        renderedTemplate,
        block,
        renderedBlocks.join(''),
      );
    });

  return renderedTemplate;
}

/**
 * Renders a template in these steps
 * 1. expand conditional blocks. this will remove any blocks that do not match their expressions and choose from if / elseif / else block which of them to render
 * 2. expand iterations. this will create new templates for each iteration and re-run the rendering for those blocks
 * 3. render attributes. this will add the attributes to all the blocks not within each blocks
 * @param {string|string[]} template
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
export function renderTemplate(template, data) {
  const templateString = Array.isArray(template)
    ? template.join('\n')
    : template;
  const conditionalTemplate = expandConditionalsAndLoops(templateString, data);
  return replaceAttributes(conditionalTemplate, data);
}
