import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { renderToString } from 'react-dom/server';
import classNames from 'classnames';
import ModalContent from './components/modalContent';
import styles from './assets/css/transaction.scss';

export const openTransModal = async (
  stepInfo = { step: 0, txId: '', customObj: {} },
) => {
  let container: any = document.querySelector('.wg-modal-root');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('wg-modal-root');

    const contentString: any = ModalContent(stepInfo);
    container.innerHTML = renderToString(contentString);
    document.body.appendChild(container);
  } else {
    const contentString: any = ModalContent(stepInfo);
    container.innerHTML = renderToString(contentString);
  }
  container.style.display = 'block';

  let closeIcon: any = document.querySelector('.modal-close');
  closeIcon.onclick = () => {
    container.style.display = 'none';
  };
};

export const addNewTransactionToList = (
  tx: string,
  customObj: any,
  saveAmount: number = 10,
  tronweb: any
) => {
  try {
    const tronWeb = tronweb || (window as any).tronWeb;
    if (!tronWeb.defaultAddress) return;
    let data =
      window.localStorage.getItem(
        `${tronWeb.defaultAddress.base58}_transaction`
      ) || '[]';
    let dataArr = JSON.parse(data);
    let item = {
      title: '', // compatible
      customObj,
      tx,
      status: 1, // 1: pending, 2: confirmed, 3: failed
      checkCnt: 0,
      showPending: true,
    };
    dataArr.unshift(item);
    window.localStorage.setItem(
      `${tronWeb.defaultAddress.base58}_transaction`,
      JSON.stringify(dataArr.slice(0, saveAmount))
    );
  } catch (error) {
    console.log(error);
  }
};

const updateTransactionInList = (record: any, tronweb: any = null) => {
  const { tx, status } = record;
  const tronWeb = tronweb || (window as any).tronWeb;
  let data =
    window.localStorage.getItem(
      `${tronWeb.defaultAddress.base58}_transaction`
    ) || '[]';
  let dataArr = JSON.parse(data);
  let pos: string | number = 'true';
  dataArr.map((item: { tx: any }, index: number) => {
    if (item.tx.txid === tx.txid) {
      pos = index;
    }
  });

  if (pos === 'true') {
    return;
  }

  dataArr[pos] = record;

  if (status !== 1) {
    dataArr.splice(pos, 1);
  }

  window.localStorage.setItem(
    `${tronWeb.defaultAddress.base58}_transaction`,
    JSON.stringify(dataArr)
  );
};

const logTransaction = async (
  item: {
    checkCnt?: any;
    tx?: any;
    status?: any;
    showPending?: any;
    customObj?: any;
  },
  status: number,
  {
    intlText = {
      pending: 'Pending',
      confirmed: ' Confirmed',
      failed: 'Failed',
    },
  } = {}
) => {
  item.status = status;
  if (status === 1) {
    item.showPending = false;
  }
  const { customObj } = item;

  let description = intlText?.pending;
  if (status === 2) description = intlText?.confirmed;
  if (status === 3) description = intlText?.failed;

  const notifyContent = (
    <div className={classNames(styles.notification, 'notification')}>
      <div className="message">{customObj?.title}</div>
      <div className="description">
        {await getDescription(status, item, description)}
      </div>
      <div className={classNames(styles.notifyClose, 'notify-close')}>{<CloseOutlined />} </div>
    </div>
  );

  let container: any = document.querySelector('.wg-notify-root');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('wg-notify-root');
    // container.innerHTML = renderToString(notifyContent);
    container.innerHTML = renderToString(notifyContent);
    document.body.appendChild(container);
  } else {
    // container.innerHTML = renderToString(notifyContent);
    container.innerHTML = renderToString(notifyContent);
  }
  container.style.display = 'block';

  let closeIcon: any = document.querySelector('.notify-close');
  closeIcon.onclick = () => {
    container.style.display = 'none';
  };

  updateTransactionInList(item);

  setTimeout(
    () => {
      container.style.display = 'none';
    },
    status === 3 ? 30000 : 5000
  );
};

const getDescription = async (
  type: number,
  item: any,
  text: string,
  tronscanLink: string = 'https://nile.tronscan.io/#',
  {
    statusTexts = {
      pending: 'Pending',
      confirmed: 'Transaction Broadcasted',
      failed: 'Transaction Failed'
    },
    intl = {
      tronscan: 'View on TRONSCAN',
      errTip:
        'Failure may be caused by the following situations, please check if:<br />①your Energy or bandwidth is insufficient; please top up<br />②your slippage is too low; please reset<br />③your current network is congested; please try again later<br />④your system time is incorrect; please check and try again',
    }
  } = {}
) => {
  const { tx, view_on_tronscan } = item;
  const { txid } = tx;
  let className = '';
  let statusText = '';
  switch (type) {
    case 1:
      className = 'trans-pending';
      statusText = statusTexts.pending;
      break;
    case 2:
      className = 'trans-confirmed';
      statusText = statusTexts.confirmed;
      break;
    case 3:
      className = 'trans-failed';
      statusText = statusTexts.failed;
      break;
  }

  const notifyDom = (
    <div className={styles.notify}>
      <span
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '14px',
        }}
      >
        <a
          className="typo-text-link"
          href={`${tronscanLink}/transaction/${txid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {view_on_tronscan ? view_on_tronscan : intl.tronscan}
        </a>
        <a>{statusText}</a>
      </span>
      {type === 3 ? (
        <div className={'flex between ai-center'}>
          <div
            className={styles.errTip}
            dangerouslySetInnerHTML={{ __html: intl.errTip }}
          ></div>
          <span className="wg-notify-ques">?</span>
          <span className={'trans-btn-tip ' + className}>{text}</span>
        </div>
      ) : (
        <span className={'trans-btn-tip ' + className}>{text}</span>
      )}
    </div>
  );
  const ques: any = document.querySelector('.wg-notify-ques');
  const errTip: any = document.querySelector('.wg-notify-errTip');
  const notify: any = document.querySelector('.wg-trans-notify');

  if (ques) {
    ques.onmouseover = () => {
      errTip.style.display = 'block';
    };
    ques.onmouseend = () => {
      errTip.style.display = 'none';
    };
  }

  if (notify) {
    setTimeout(() => {
      notify.style.display = 'none';
    }, 5000);
  }

  return notifyDom;
};

const getTransactionInfo = (txid: string, tronweb = null) => {
  const tronWeb = tronweb || (window as any).tronWeb;
  return new Promise((resolve, reject) => {
    tronWeb.trx.getConfirmedTransaction(txid, (e: any, r: unknown) => {
      if (!e) {
        resolve(r);
      } else {
        reject(e);
      }
    });
  });
};

const checkPendingTransactions = (intlText: any = null) => {
  const tronWeb = (window as any).tronWeb;
  let data =
    window.localStorage.getItem(
      `${tronWeb.defaultAddress.base58}_transaction`
    ) || '[]';
  const transactions = JSON.parse(data);

  transactions.map(
    (item: { checkCnt?: any; tx?: any; status?: any; showPending?: any }) => {
      const { tx, status, showPending } = item;
      if (Number(status) === 1) {
        if (showPending) {
          logTransaction(item, 1, { intlText });
        }
        item.checkCnt++;
        getTransactionInfo(tx.txid)
          .then((r: any) => {
            if (r && r.ret && r.ret[0] && r.ret[0].contractRet) {
              if (r.ret[0].contractRet === 'SUCCESS') {
                logTransaction(item, 2, { intlText });
              } else {
                logTransaction(item, 3, { intlText });
              }
            } else {
              if (item.checkCnt != undefined && item.checkCnt >= 30) {
                logTransaction(item, 3, { intlText });
              }
            }
          })
          .catch((ex) => {
            console.error(ex);
          });
      }
      return false;
    }
  );
};

export const startPendingTransactionCheck = (milliseconds: number = 3000, intlText: any = null) => {
  let interval = null;
  if (!interval) {
    interval = setInterval(async () => {
      try {
        checkPendingTransactions(intlText);
      } catch (err) {
        console.log('interval error:' + err);
      }
    }, milliseconds);
  }
};