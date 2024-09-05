import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import BAISelect from './BAISelect';
import Flex from './Flex';
import ResourceGroupSelect from './ResourceGroupSelect';
import {
  SessionOwnerSetterCardQuery,
  SessionOwnerSetterCardQuery$data,
} from './__generated__/SessionOwnerSetterCardQuery.graphql';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { BanIcon, CheckIcon } from 'lucide-react';
import React, { startTransition, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchQuery, useRelayEnvironment } from 'react-relay';

const SessionOwnerSetterCard = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const form = Form.useFormInstance();

  const isActive = Form.useWatch(['owner', 'enabled'], form);

  const [fetchingEmail, setFetchingEmail] = useState<string>();
  const relayEvn = useRelayEnvironment();
  const domainName = useCurrentDomainValue();

  // const baiClient = useSuspendedBackendaiClient();
  const { data, isFetching } = useTanQuery({
    queryKey: ['SessionOwnerSetterCard', 'ownerInfo', fetchingEmail],
    queryFn: () => {
      const email = form.getFieldValue(['owner', 'email']);
      if (!email) return;

      const query = graphql`
        query SessionOwnerSetterCardQuery(
          $email: String!
          $domainName: String!
        ) {
          keypairs(email: $email) {
            access_key
          }
          user(domain_name: $domainName, email: $email) {
            groups {
              name
              id
            }
          }
        }
      `;
      return fetchQuery<SessionOwnerSetterCardQuery>(relayEvn, query, {
        email,
        domainName,
      }).toPromise();
    },
    enabled: !!fetchingEmail,
  });

  console.log('###', data);
  const ownerKeypairs = data?.keypairs;
  const owner = data?.user;

  // const handleFetchOwnerInfo = async () => {
  //   const email = form.getFieldValue(['owner', 'email']);
  //   if (email) {
  //     const query = graphql`
  //       query SessionOwnerSetterCardQuery(
  //         $email: String!
  //         $domainName: String!
  //       ) {
  //         keypairs(email: $email) {
  //           access_key
  //         }
  //         user(domain_name: $domainName, email: $email) {
  //           groups {
  //             name
  //             id
  //           }
  //         }
  //       }
  //     `;
  //     try {
  //       const data = await fetchQuery<SessionOwnerSetterCardQuery>(
  //         relayEvn,
  //         query,
  //         { email, domainName },
  //       ).toPromise();
  //       setOwnerInfo(data);
  //       // console.log('Fetched owner info:', data);
  //     } catch (error) {
  //       // console.error('Error fetching owner info:', error);
  //     }
  //   }
  // };

  // const handleFetchOwnerInfo = async () => {
  //   if(fetchingEmail){
  //     const query = graphql`
  //       query SessionOwnerSetterCardQuery($email: String!) {

  //       }
  //     `
  //   }
  // }

  // console.log(data?.keypairs);
  // useEffect(() => {
  //   if (
  //     data?.keypairs &&
  //     !_.find(
  //       data.keypairs,
  //       (k) => form.getFieldValue(['owner', 'accesskey']) === k.access_key,
  //     )
  //   ) {
  //     form.setFieldsValue({
  //       owner: {
  //         accesskey: data.keypairs[0].access_key,
  //       },
  //     });
  //   }
  // }, [data?.keypairs]);

  const nonExistentOwner = !isFetching && fetchingEmail && !owner;
  return (
    <Card
      title={t('session.launcher.SetSessionOwner')}
      extra={
        <Form.Item name={['owner', 'enabled']} valuePropName="checked" noStyle>
          <Switch />
        </Form.Item>
      }
      styles={
        isActive
          ? undefined
          : {
              header: {
                borderBottom: 'none',
              },
              body: {
                display: isActive ? 'block' : 'none',
              },
            }
      }
    >
      <Form.Item dependencies={[['owner', 'enabled']]} noStyle>
        {({ getFieldValue }) => {
          return (
            <>
              <Flex>
                <Form.Item
                  name={['owner', 'email']}
                  label={t('session.launcher.OwnerEmail')}
                  rules={[
                    {
                      required: isActive,
                    },
                    {
                      type: 'email',
                      message: t('credential.validation.InvalidEmailAddress'),
                    },
                  ]}
                  style={{ flex: 1 }}
                  validateStatus={nonExistentOwner ? 'error' : undefined}
                  help={
                    nonExistentOwner
                      ? t('credential.NoUserToDisplay')
                      : undefined
                  }
                >
                  <Input.Search
                    onSearch={(v) => {
                      // startTransition(()=>{

                      form
                        .validateFields([['owner', 'email']])
                        .then(() => {
                          setFetchingEmail(v);
                        })
                        .catch(() => {});
                      // })
                    }}
                    onChange={() => {
                      setFetchingEmail('');
                      form.setFieldsValue({
                        owner: {
                          accesskey: '',
                          group: undefined,
                          'scaling-group': undefined,
                        },
                      });
                    }}
                    loading={isFetching}
                    enterButton={
                      !isFetching && owner ? (
                        <Button icon={<CheckIcon />} />
                      ) : undefined
                    }
                  />
                </Form.Item>
              </Flex>
              <Form.Item
                name={['owner', 'accesskey']}
                label={t('session.launcher.OwnerAccessKey')}
                rules={[
                  {
                    required: getFieldValue(['owner', 'enabled']),
                  },
                ]}
              >
                <BAISelect
                  options={_.map(ownerKeypairs, (k) => {
                    return {
                      label: k?.access_key,
                      value: k?.access_key,
                    };
                  })}
                  autoSelectOption
                  disabled={_.isEmpty(fetchingEmail)}
                  // defaultActiveFirstOption
                />
              </Form.Item>
              <Row gutter={token.marginSM}>
                <Col span={12}>
                  <Form.Item
                    name={['owner', 'group']}
                    label={t('session.launcher.OwnerGroup')}
                    rules={[
                      {
                        required: getFieldValue(['owner', 'enabled']),
                      },
                    ]}
                  >
                    <BAISelect
                      options={_.map(owner?.groups, (g) => {
                        return {
                          label: g?.name,
                          value: g?.name,
                        };
                      })}
                      autoSelectOption
                      disabled={_.isEmpty(fetchingEmail)}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item dependencies={[['owner', 'group']]} noStyle>
                    {({ getFieldValue }) => {
                      return (
                        <Form.Item
                          name={['owner', 'scaling-group']}
                          label={t('session.launcher.OwnerResourceGroup')}
                          rules={[
                            {
                              required: getFieldValue(['owner', 'enabled']),
                            },
                          ]}
                        >
                          <Suspense fallback={<Select loading />}>
                            {getFieldValue(['owner', 'group']) ? (
                              <ResourceGroupSelect
                                projectName={getFieldValue(['owner', 'group'])}
                                disabled={_.isEmpty(fetchingEmail)}
                                autoSelectDefault
                              />
                            ) : (
                              <Select disabled />
                            )}
                          </Suspense>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                </Col>
              </Row>
            </>
          );
        }}
      </Form.Item>
    </Card>
  );
};

export default SessionOwnerSetterCard;
