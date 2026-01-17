import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SocialLoginButton } from '@/src/components/auth/SocialLoginButton';

describe('SocialLoginButton', () => {
  it('Google 버튼을 렌더링해야 한다', () => {
    const onClick = vi.fn();
    render(<SocialLoginButton provider="google" onClick={onClick} />);

    const button = screen.getByRole('button', { name: /Google로 계속하기/i });
    expect(button).toBeInTheDocument();
  });

  it('Kakao 버튼을 렌더링해야 한다', () => {
    const onClick = vi.fn();
    render(<SocialLoginButton provider="kakao" onClick={onClick} />);

    const button = screen.getByRole('button', { name: /Kakao로 계속하기/i });
    expect(button).toBeInTheDocument();
  });

  it('Google 버튼 클릭 시 onClick이 호출되어야 한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SocialLoginButton provider="google" onClick={onClick} />);

    const button = screen.getByRole('button', { name: /Google로 계속하기/i });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Kakao 버튼 클릭 시 onClick이 호출되어야 한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SocialLoginButton provider="kakao" onClick={onClick} />);

    const button = screen.getByRole('button', { name: /Kakao로 계속하기/i });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서는 클릭할 수 없어야 한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SocialLoginButton provider="google" onClick={onClick} disabled />);

    const button = screen.getByRole('button', { name: /Google로 계속하기/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('Google 버튼은 흰색 배경과 검정 텍스트 스타일을 가져야 한다', () => {
    const onClick = vi.fn();
    render(<SocialLoginButton provider="google" onClick={onClick} />);

    const button = screen.getByRole('button', { name: /Google로 계속하기/i });
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('text-gray-900');
  });

  it('Kakao 버튼은 노란색 배경과 검정 텍스트 스타일을 가져야 한다', () => {
    const onClick = vi.fn();
    render(<SocialLoginButton provider="kakao" onClick={onClick} />);

    const button = screen.getByRole('button', { name: /Kakao로 계속하기/i });
    expect(button.className).toContain('bg-[#FEE500]');
    expect(button).toHaveClass('text-gray-900');
  });
});
