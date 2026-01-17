import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/src/components/ui/Modal';

describe('Modal', () => {
  it('렌더링되지 않음 (isOpen=false)', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('렌더링됨 (isOpen=true)', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('백드롭 클릭 시 onClose 호출', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('ESC 키로 닫기', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('모달 컨테이너 클릭 시 onClose 호출 안 함', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });
});
