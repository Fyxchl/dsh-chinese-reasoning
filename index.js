/**
 * Keep the model's internal reasoning (chain-of-thought) in Simplified Chinese.
 *
 * The DeepSeek API has no wire field for the reasoning language, so the only
 * reliable lever is the assembled system prompt. This plugin registers one
 * late, plain-language section that asks for Chinese reasoning without
 * overriding any other instruction. Code, commands, paths, identifiers, and
 * quoted text keep their original language.
 *
 * Placement: after tool and policy sections, just after the deployment persona
 * suffix, where a request-level language preference is read last.
 *
 * @module @local/chinese-reasoning
 */

/** Stable section name, unique within the global prompt layer. */
const SECTION_NAME = 'local:chinese-reasoning'

/** Default section order: after the deployment persona suffix (10200). */
const DEFAULT_ORDER = 10250

/** Hard dependency: without the prompt registry this row has nothing to do. */
export const inject = ['systemPrompt']

/**
 * Build the prompt section text for the configured language.
 * @param language - language name placed in the instruction.
 * @returns the section body.
 */
function sectionText(language) {
  return [
    '## 推理语言',
    '',
    `进行内部推理（reasoning / 思考链）时，请使用${language}。即使问题、代码、日志或工具输出是英文，也请用${language}思考。`,
    '代码、命令、路径、标识符、API 名称以及引用的原文保持原样，不要翻译。',
    '这只影响内部推理；最终回答使用哪种语言，仍按用户和任务的要求。',
  ].join('\n')
}

/**
 * Read the language name from the row config, falling back to Simplified
 * Chinese. The value is trimmed and length-bounded so a config typo cannot
 * inject free-form text into the prompt.
 * @param config - the Loader row config, possibly undefined.
 * @returns a safe language name.
 */
function languageOf(config) {
  const value = config?.language
  if (typeof value !== 'string') return '简体中文'
  const trimmed = value.trim()
  return trimmed.length > 0 && trimmed.length <= 32 ? trimmed : '简体中文'
}

/**
 * Read the section order from the row config, falling back to the default.
 * @param config - the Loader row config, possibly undefined.
 * @returns a finite, bounded order.
 */
function orderOf(config) {
  const value = config?.order
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_ORDER
  return value >= -100000 && value <= 100000 ? value : DEFAULT_ORDER
}

/**
 * Register the reasoning-language section.
 * @param ctx - the plugin context.
 * @param config - the Loader row config.
 */
export function apply(ctx, config = {}) {
  const language = languageOf(config)
  const order = orderOf(config)
  ctx.effect(
    () => ctx.systemPrompt.section({ name: SECTION_NAME, order, text: sectionText(language) }),
    'chinese-reasoning.section()',
  )
}
