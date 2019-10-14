import React, { Component } from 'react';
import styled from 'styled-components';
import { Form, Select, Icon, Input, Switch, Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { withUserAgent } from 'react-useragent';
import queryString from 'query-string';

import {
  PGS,
  METHODS_FOR_INICIS,
  QUOTAS_FOR_INICIS_AND_KCP,
} from './constants';
import { getMethods, getQuotas } from './utils';

const { Item } = Form;
const { Option } = Select;


class PaymentAsClass extends Component {

  constructor(props) {
    super(props)
    this.state={
      methods: METHODS_FOR_INICIS,
      quatas: QUOTAS_FOR_INICIS_AND_KCP,
      isQuotaRequired : true,
      isDigitalRequired : false,
      isVbankDueRequired : false,
      isBizNumRequired : false,
    }
  }

  handleSubmit=(e)=>{
    e.preventDefault();
    
    this.props.form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        /*this is the code that connect with PG*/
        const userCode = 'imp23274934';
     
        const {
          pg,
          pay_method,
          merchant_uid,
          name,
          amount,
          buyer_name,
          buyer_tel,
          buyer_email,
          escrow,
          card_quota,
          biz_num,
          vbank_due,
          digital,
        } = values;

        const data = {
          pg,
          pay_method,
          merchant_uid,
          name,
          amount,
          buyer_name,
          buyer_tel,
          buyer_email,
          escrow,
        };

        // if (pay_method === 'vbank') {
        //   data.vbank_due = vbank_due;
        //   if (pg === 'danal_tpay') {
        //     data.biz_num = biz_num;
        //   }
        // }
        // if (pay_method === 'card') {
        //   if (card_quota !== 0) {
        //     data.digital = { card_quota: card_quota === 1 ? [] : card_quota };
        //   }
        // }
        // if (pay_method === 'phone') {
        //   data.digital = digital;
        // }

        if (this.isReactNative()) {
          /* for react-native, this is the part that we using  */
          const params = {
            userCode,
            data,
            type: 'payment', 
          };
          const paramsToString = JSON.stringify(params);
          window.ReactNativeWebView.postMessage(paramsToString);
        } else {
          /* this is for web */
          const { IMP } = window;
          IMP.init(userCode);
          IMP.request_pay(data, this.callback);
        }
      }
    });
  }

  callback=(response)=> {
    const query = queryString.stringify(response);
    this.props.history.push(`/payment/result?${query}`);
  }

  onChangePg=(value)=> {
    /* How to payment  */
    const methods = getMethods(value);
    this.setState({methods})
    this.props.form.setFieldsValue({ pay_method: methods[0].value })

    /* payment tiem */
    const { pay_method } = this.props.form.getFieldsValue();
    this.handleQuotas(value, pay_method);

    /* donot care about this. this is for other purposes.*/
    let isBizNumRequired = false;
    let isVbankDueRequired = false;
    if (pay_method === 'vbank') {
      if (value === 'danal_tpay') {
        isBizNumRequired = true;
      }
      isVbankDueRequired = true;
    }
    this.setState( {isBizNumRequired, isVbankDueRequired});
  }


  handleQuotas=(pg, pay_method)=>{
    const { isQuotaRequired, quotas } = getQuotas(pg, pay_method);
    this.setState({isQuotaRequired, quotas});

    this.props.form.setFieldsValue({ card_quota: quotas[0].value })
  }

  //  onChangePayMethod=(value)=>{
  //   const { pg } = this.props.getFieldsValue();
  //   let isQuotaRequired = false;
  //   let isDigitalRequired = false;
  //   let isVbankDueRequired = false;
  //   let isBizNumRequired = false;
  //   switch (value) {
  //     case 'card': {
  //       isQuotaRequired = true;
  //       break;
  //     }
  //     case 'phone': {
  //       isDigitalRequired = true;
  //       break;
  //     }
  //     case 'vbank': {
  //       if (pg === 'danal_tpay') {
  //         isBizNumRequired = true;
  //       }
  //       isVbankDueRequired = true;
  //       break;
  //     }
  //     default:
  //       break;
  //   }
  //   this.setState({isQuotaRequired,
  //     isDigitalRequired,
  //     isVbankDueRequired,
  //     isBizNumRequired});

  //   this.handleQuotas(pg, value);
  // }

  isReactNative=()=>{
    /* check if it is reactive*/
    if (this.props.ua.mobile) return true;
    return false;
  }

  render(){

    const { getFieldDecorator} = this.props.form;
    return (
      <Wrapper>
        <Header>결제 진행하기</Header>
        <FormContainer onSubmit={this.handleSubmit}>
          <Item label="PG사">
            {getFieldDecorator('pg', {
              initialValue: 'kakaopay',
            })(
              <Select
                size="large"
                onChange={this.onChangePg}
                suffixIcon={<Icon type="caret-down" />}
              >
                {PGS.map(pg => {
                  const { value, label } = pg;
                  return <Option value={value} key={value}>{label}</Option>;
                })}
              </Select>
            )}
          </Item>
          {/* <Item label="결제수단">
            {getFieldDecorator('pay_method', {
              initialValue: 'card',
            })(
              <Select
                size="large"
                onChange={this.onChangePayMethod}
                suffixIcon={<Icon type="caret-down" />}
              >
                {this.state.methods.map(method => {
                  const { value, label } = method;
                  return <Option value={value} key={value}>{label}</Option>;
                })}
              </Select>
            )}
          </Item> */}
          {/* {this.state.isQuotaRequired && (
            <Item label="할부개월수">
              {getFieldDecorator('card_quota', {
                initialValue: 0,
              })(
                <Select size="large" suffixIcon={<Icon type="caret-down" />}>
                  {this.state.quatas.map(quota => {
                    const { value, label } = quota;
                    return <Option value={value} key={value}>{label}</Option>;
                  })}
                </Select>
              )}
            </Item>
          )} */}
          {/* {this.state.isVbankDueRequired && (<Item>
            {getFieldDecorator('vbank_due', {
              rules: [{ required: true, message: '입금기한은 필수입력입니다' }],
            })(
              <Input size="large" type="number" addonBefore="입금기한" placeholder="YYYYMMDDhhmm" />,
            )}
          </Item>)}
          {this.state.isBizNumRequired && (
            <Item>
              {getFieldDecorator('biz_num', {
                rules: [{ required: true, message: '사업자번호는 필수입력입니다' }],
              })(
                <Input size="large" type="number" addonBefore="사업자번호" />,
              )}
            </Item>
          )} */}
          {/* {this.state.isDigitalRequired && (
            <Item label="실물여부" className="toggle-container">
              {getFieldDecorator('digital', {
                valuePropName: 'checked',
              })(<Switch />)}
            </Item>
          )} */}
          {/* <Item label="에스크로" className="toggle-container">
            {getFieldDecorator('escrow', {
              valuePropName: 'checked',
            })(<Switch />)}
          </Item> */}
          <Item>
            {getFieldDecorator('name', {
              initialValue: 'The product name',
              rules: [{ required: true, message: '주문명은 필수입력입니다' }],
            })(
              <Input size="large" addonBefore="주문명" />,
            )}
          </Item>
          <Item>
            {getFieldDecorator('amount', {
              initialValue: '0',
              rules: [{ required: true, message: '결제금액은 필수입력입니다' }],
            })(
              <Input size="large" type="number" addonBefore="결제금액" />,
            )}
          </Item>
          <Item>
            {getFieldDecorator('merchant_uid', {
              initialValue: `min_${new Date().getTime()}`,
              rules: [{ required: true, message: '주문번호는 필수입력입니다' }],
            })(
              <Input size="large" addonBefore="주문번호" />,
            )}
          </Item>
          <Item>
            {getFieldDecorator('buyer_name', {
              initialValue: '홍길동',
              rules: [{ required: true, message: '구매자 이름은 필수입력입니다' }],
            })(
              <Input size="large" addonBefore="이름" />,
            )}
          </Item>
          <Item>
            {getFieldDecorator('buyer_tel', {
              initialValue: '01012341234',
              rules: [{ required: true, message: '구매자 전화번호는 필수입력입니다' }],
            })(
              <Input size="large" type="number" addonBefore="전화번호" />,
            )}
          </Item>
          <Item>
            {getFieldDecorator('buyer_email', {
              initialValue: 'example@example.com',
              rules: [{ required: true, message: '구매자 이메일은 필수입력입니다' }],
            })(
              <Input size="large" addonBefore="이메일" />,
            )}
          </Item>
          <Button type="primary" htmlType="submit" size="large">
            결제하기
          </Button>
        </FormContainer>
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  padding: 5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Header = styled.div`
  font-weight: bold;
  text-align: center;
  padding: 2rem;
  padding-top: 0;
  font-size: 3rem;
`;

const FormContainer = styled(Form)`
  width: 350px;
  border-radius: 3px;

  .ant-row {
    margin-bottom: 1rem;
  }
  .ant-form-item {
    display: flex;
    align-items: center;
  }
  .ant-col.ant-form-item-label {
    padding: 0 11px;
    width: 9rem;
    text-align: left;
    label {
      color: #888;
      font-size: 1.2rem;
    }
    & + .ant-col.ant-form-item-control-wrapper {
      width: 26rem;
      .ant-form-item-control {
        line-height: inherit;
      }
    }
  }
  .ant-col.ant-form-item-label > label::after {
    display: none;
  }
  .ant-row.ant-form-item.toggle-container .ant-form-item-control {
    padding: 0 11px;
    height: 4rem;
    display: flex;
    align-items: center;
    .ant-switch {
      margin: 0;
    }
  }

  .ant-form-explain {
    margin-top: 0.5rem;
    margin-left: 9rem;
  }

  .ant-input-group-addon:first-child {
    width: 9rem;
    text-align: left;
    color: #888;
    font-size: 1.2rem;
    border: none;
    background-color: inherit;
  }
  .ant-input-group > .ant-input:last-child {
    border-radius: 4px;
  }

  .ant-col {
    width: 100%;
  }

  button[type='submit'] {
    width: 100%;
    height: 5rem;
    font-size: 1.6rem;
    margin-top: 2rem;
  }
`;


const PaymentForm = Form.create({ name: 'payment' })(PaymentAsClass);

export default withUserAgent(withRouter(PaymentForm));
