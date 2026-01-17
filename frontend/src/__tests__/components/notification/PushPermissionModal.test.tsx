import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PushPermissionModal from '@/src/components/notification/PushPermissionModal';

describe('PushPermissionModal', () => {
  it('isOpen이 false일 때 렌더링되지 않는다', () => {
    const onClose = vi.fn();
    const onAllow = vi.fn();

    render(
      <PushPermissionModal isOpen={false} onClose={onClose} onAllow={onAllow} />
    );

    expect(screen.queryByText('알림을 받으시겠습니까?')).not.toBeInTheDocument();
  });

  it('isOpen이 true일 때 모달이 렌더링된다', () => {
    const onClose = vi.fn();
    const onAllow = vi.fn();

    render(
      <PushPermissionModal isOpen={true} onClose={onClose} onAllow={onAllow} />
    );

    expect(screen.getByText('알림을 받으시겠습니까?')).toBeInTheDocument();
    expect(screen.getByText('마감 임박 정책 알림을 받을 수 있습니다')).toBeInTheDocument();
    expect(screen.getByText('나중에')).toBeInTheDocument();
    expect(screen.getByText('알림 허용')).toBeInTheDocument();
  });

  it('나중에 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    const onAllow = vi.fn();

    render(
      <PushPermissionModal isOpen={true} onClose={onClose} onAllow={onAllow} />
    );

    const laterButton = screen.getByText('나중에');
    fireEvent.click(laterButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('알림 허용 버튼 클릭 시 onAllow가 호출되고 모달이 닫힌다', async () => {
    const onClose = vi.fn();
    const onAllow = vi.fn().mockResolvedValue(undefined);

    render(
      <PushPermissionModal isOpen={true} onClose={onClose} onAllow={onAllow} />
    );

    const allowButton = screen.getByText('알림 허용');
    fireEvent.click(allowButton);

    await waitFor(() => {
      expect(onAllow).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('알림 허용 중 로딩 상태를 표시한다', async () => {
    const onClose = vi.fn();
    const onAllow = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <PushPermissionModal isOpen={true} onClose={onClose} onAllow={onAllow} />
    );

    const allowButton = screen.getByText('알림 허용');
    fireEvent.click(allowButton);

    expect(screen.getByText('처리 중...')).toBeInTheDocument();

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('onAllow 실패 시 에러를 처리한다', async () => {
    const onClose = vi.fn();
    const onAllow = vi.fn().mockRejectedValue(new Error('Permission denied'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PushPermissionModal isOpen={true} onClose={onClose} onAllow={onAllow} />
    );

    const allowButton = screen.getByText('알림 허용');
    fireEvent.click(allowButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
