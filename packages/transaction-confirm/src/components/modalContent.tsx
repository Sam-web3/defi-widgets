import React from 'react';
import {
  Loading3QuartersOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import classNames from 'classnames';
import styles from '../assets/css/transaction.scss';

// interface CustomObjType {
//   title?: string;
//   wait_confirm?: string;
//   confirm_wallet?: string;
//   submitted?: string;
//   view_on_tronscan?: string;
//   cancelled?: string;
// }

const title = 'Transaction';
const wait_confirm = 'Waiting for your confirmation';
const confirm_wallet = 'Please confirm in your wallet';
const submitted = 'Transaction Submitted';
const view_on_tronscan = 'View on TRONSCAN';
const cancelled = 'Transaction Cancelled';

const modalContent = (
  stepInfo: any = {
    step: 0,
    txId: '',
    customObj: {}
  },
  {
    tronscanLink = 'https://nile.tronscan.io/#'
  } = {}
) => {
  const { step, txId, customObj } = stepInfo;

  if (!step) return;

  return (
    <div className={styles.transModalContainer}>
      <div className={styles.transModalMask}></div>
      <div className={styles.transContent}>
        <div className={styles.transBody}>
          <div className={styles.transTitle}>
            {customObj?.title || title}
          </div>
          {step == 1 ? (
            <React.Fragment>
              <div className={styles.loading}>
                <Loading3QuartersOutlined
                  style={{
                    fontSize: '60px',
                    display: 'flex',
                    margin: '20px 0',
                  }}
                />
              </div>
              <div className="trans-modal-status trans-modal-wait-confirm">
                {customObj?.wait_confirm || wait_confirm}
              </div>
              <div className="trans-modal-tips trans-modal-wait-confirm-tips">
                {customObj?.confirm_wallet || confirm_wallet}
              </div>
            </React.Fragment>
          ) : step == 2 ? (
            <React.Fragment>
              <div className={styles.modalIcon}>
                <CheckCircleOutlined
                  style={{ fontSize: '80px', color: '#1bc378' }}
                ></CheckCircleOutlined>
              </div>
              <div className="trans-modal-status trans-modal-submit">
                {customObj?.submitted || submitted}
              </div>
              {txId && (
                <div className="trans-modal-tips trans-modal-submit-tips">
                  <a
                    className="typo-text-link"
                    href={`${tronscanLink}/transaction/${txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {customObj?.view_on_tronscan || view_on_tronscan}
                  </a>
                </div>
              )}
            </React.Fragment>
          ) : step == 3 ? (
            <React.Fragment>
              <div className={styles.modalIcon}>
                <CloseCircleOutlined
                  style={{ fontSize: '80px', color: '#d84b79' }}
                ></CloseCircleOutlined>
              </div>
              <div className="trans-modal-status trans-modal-cancel">
                {customObj?.cancelled || cancelled}
              </div>
            </React.Fragment>
          ) : (
            <></>
          )}
          <div className={classNames(styles.modalClose, 'modal-close')}>
            <CloseOutlined />
          </div>
        </div>
      </div>
    </div>
  )
}

export default modalContent;