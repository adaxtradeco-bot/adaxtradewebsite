import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import CustomHtmlSection from '@/components/builder-sections/CustomHtmlSection';
import { CHS_EVENTS } from '@/lib/custom-html/client-role';
import { makeFixture, makeFixtureInput, SCOPE } from './fixtures';

afterEach(cleanup);

describe('CustomHtmlSection', () => {
  it('renders html and scoped css for valid data', () => {
    const { container } = render(<CustomHtmlSection data={makeFixture()} sectionId="s1" isBuilder={false} />);
    const wrapper = container.querySelector(`[data-chs="${SCOPE}"]`) as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.getAttribute('data-chs-instance')).toMatch(/^s1-/);
    expect(wrapper.getAttribute('dir')).toBe('ltr');
    expect(wrapper.querySelector('h1')?.textContent).toBe('Hello world');
    expect(wrapper.querySelector('a')?.getAttribute('href')).toBe('/go');
    expect(wrapper.querySelector('style')?.textContent).toContain('color:red');
  });

  it('uses stored values over defaults', () => {
    const data = makeFixture({ values: { f1: 'Custom title' } });
    const { container } = render(<CustomHtmlSection data={data} sectionId="s1" />);
    expect(container.querySelector('h1')?.textContent).toBe('Custom title');
  });

  it('renders null on public pages for invalid data', () => {
    const { container } = render(<CustomHtmlSection data={{ nope: true }} sectionId="s1" isBuilder={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows an inline notice in the builder for invalid data', () => {
    const { getByTestId } = render(<CustomHtmlSection data={{ nope: true }} sectionId="s1" isBuilder />);
    expect(getByTestId('custom-html-invalid')).toBeTruthy();
  });

  it('accepts public payloads with css/jsSource stripped', () => {
    const input = makeFixtureInput() as any;
    delete input.template.css;
    delete input.template.jsSource;
    const { container } = render(<CustomHtmlSection data={input} sectionId="s1" isBuilder={false} />);
    expect(container.querySelector('h1')?.textContent).toBe('Hello world');
  });

  it('strips data-cf on public pages and keeps it in the builder', () => {
    const pub = render(<CustomHtmlSection data={makeFixture()} sectionId="s1" isBuilder={false} />);
    expect(pub.container.querySelector('[data-cf]')).toBeNull();
    pub.unmount();
    const bld = render(<CustomHtmlSection data={makeFixture()} sectionId="s1" isBuilder />);
    expect(bld.container.querySelector('h1')?.getAttribute('data-cf')).toBe('f1');
  });

  it('dispatches selectField without stopping propagation when a [data-cf] element is clicked in the builder', () => {
    const handler = vi.fn();
    const parentClick = vi.fn();
    window.addEventListener(CHS_EVENTS.selectField, handler);
    const { container } = render(
      <div onClick={parentClick}>
        <CustomHtmlSection data={makeFixture()} sectionId="s7" isBuilder />
      </div>,
    );
    fireEvent.click(container.querySelector('h1')!);
    window.removeEventListener(CHS_EVENTS.selectField, handler);
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ sectionId: 's7', fieldId: 'f1' });
    expect(parentClick).toHaveBeenCalled();
  });

  it('prevents link navigation in the builder only', () => {
    const bld = render(<CustomHtmlSection data={makeFixture()} sectionId="s1" isBuilder />);
    const notPrevented = fireEvent.click(bld.container.querySelector('a')!);
    expect(notPrevented).toBe(false);
    bld.unmount();
    const pub = render(<CustomHtmlSection data={makeFixture()} sectionId="s1" />);
    let preventedBeforeDocument: boolean | null = null;
    const spy = (e: Event) => {
      preventedBeforeDocument = e.defaultPrevented;
      e.preventDefault(); // keep jsdom from attempting navigation
    };
    document.addEventListener('click', spy);
    fireEvent.click(pub.container.querySelector('a')!);
    document.removeEventListener('click', spy);
    expect(preventedBeforeDocument).toBe(false);
  });

  it('resolves dir=auto from the document language', () => {
    document.documentElement.setAttribute('lang', 'ar');
    const data = makeFixture();
    data.template.dir = 'auto';
    const { container } = render(<CustomHtmlSection data={data} sectionId="s1" />);
    expect(container.querySelector(`[data-chs="${SCOPE}"]`)?.getAttribute('dir')).toBe('rtl');
    document.documentElement.removeAttribute('lang');
  });
});
