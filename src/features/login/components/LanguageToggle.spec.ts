import { ElDropdown } from 'element-plus'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LanguageToggle from '@/features/login/components/LanguageToggle.vue'

describe('LanguageToggle', () => {
  it('支持主按钮快速切换，也支持下拉菜单显式选择语言', async () => {
    const wrapper = mount(LanguageToggle, {
      props: {
        locale: 'zh-CN',
        languageLabel: '语言',
        englishLabel: 'EN',
        chineseLabel: '中文',
        nextLocaleLabel: '切换到英文',
      },
    })

    const trigger = wrapper.get('button')

    expect(trigger.attributes('aria-label')).toBe('切换到英文')
    expect(trigger.text()).toContain('中文')
    expect(trigger.text()).not.toContain('语言')

    await trigger.trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)

    wrapper.getComponent(ElDropdown).vm.$emit('command', 'en')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('en')
  })
})
