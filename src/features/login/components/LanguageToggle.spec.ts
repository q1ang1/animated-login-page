import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LanguageToggle from '@/features/login/components/LanguageToggle.vue'

describe('LanguageToggle', () => {
  it('显示当前语言并向父层抛出 toggle 事件', async () => {
    const wrapper = mount(LanguageToggle, {
      props: {
        locale: 'zh-CN',
        languageLabel: '语言',
        englishLabel: 'EN',
        chineseLabel: '中文',
        nextLocaleLabel: '切换到英文',
      },
    })

    expect(wrapper.text()).toContain('语言')
    expect(wrapper.text()).toContain('中文')

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})
