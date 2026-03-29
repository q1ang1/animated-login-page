import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ThemeToggle from '@/features/login/components/ThemeToggle.vue'

describe('ThemeToggle', () => {
  it('在浅色主题下展示当前主题文案并触发 toggle', async () => {
    const wrapper = mount(ThemeToggle, {
      props: {
        theme: 'light',
        themeLabel: 'Theme',
        darkLabel: 'Dark',
        lightLabel: 'Light',
        nextThemeLabel: 'Switch to dark theme',
      },
    })

    expect(wrapper.get('button').attributes('aria-label')).toBe('Switch to dark theme')
    expect(wrapper.text()).toContain('Light')

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})
