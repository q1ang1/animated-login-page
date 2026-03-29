import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ThemeToggle from '@/features/login/components/ThemeToggle.vue'

describe('ThemeToggle', () => {
  it('只渲染主题开关并在点击后触发显式主题更新', async () => {
    const wrapper = mount(ThemeToggle, {
      props: {
        theme: 'light',
        nextThemeLabel: 'Switch to dark theme',
      },
    })

    expect(wrapper.get('[role="switch"]').attributes('aria-label')).toBe('Switch to dark theme')
    expect(wrapper.get('.el-switch').classes()).toContain('el-switch--large')
    expect(wrapper.text()).toBe('')

    await wrapper.get('.el-switch').trigger('click')
    await flushPromises()

    const events = wrapper.emitted('update:theme')
    expect(events).toHaveLength(1)
    expect(events?.[0]?.[0]).toBe('dark')
    expect(events?.[0]).toHaveLength(1)
  })
})
