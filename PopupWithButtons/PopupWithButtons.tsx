import React from 'react';

import CustomButton from '../UI/CustomButton/CustomButton';

import styles from './PopupWithButtons.module.css';

type PopupPropsType = {
  popupTitle: string;
  isPopupActive: boolean;
  submitBtnTitle: string;
  hasCancelBtn?: boolean;
  children?: React.ReactNode;
  isSubmitButtonActive?: boolean;
  onCloseHandler: () => void;
  onSubmitHandler?: (e: React.FormEvent<HTMLFormElement>) => void;
};

const PopupWithButtons: React.FC<PopupPropsType> = ({
  popupTitle,
  children,
  isPopupActive,
  submitBtnTitle,
  hasCancelBtn,
  isSubmitButtonActive = true,
  onCloseHandler,
  onSubmitHandler,
}) => {
  return (
    <div
      role="presentation"
      className={`${styles.modal} ${isPopupActive && styles.modal_open}`}
      onClick={onCloseHandler}
    >
      <form
        role="presentation"
        className={styles.modal__content}
        onClick={e => e.stopPropagation()}
        onSubmit={onSubmitHandler}
      >
        <div role="presentation" className={styles.cross} onClick={onCloseHandler} />
        <h2 className={styles.modal__title}>{popupTitle}</h2>
        {children}
        <div className={styles.modal__btnGroup}>
          {hasCancelBtn ? (
            <>
              <CustomButton
                isBig={false}
                color="red"
                title="Cancel"
                type="button"
                onClick={onCloseHandler}
              />
              <CustomButton
                isBig={false}
                color="blue"
                title={submitBtnTitle}
                type="submit"
                disabled={!isSubmitButtonActive}
              />
            </>
          ) : (
            <CustomButton
              isBig
              color="blue"
              title="Okay"
              type="button"
              onClick={onCloseHandler}
              className={styles.submitBtn_big}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default PopupWithButtons;
