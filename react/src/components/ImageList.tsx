import Flex from '../components/Flex';
import { getImageFullName } from '../helper';
import { useBackendAIImageMetaData, useUpdatableState } from '../hooks';
import ImageInstallModal from './ImageInstallModal';
import { ConstraintTags } from './ImageTags';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import ResourceNumber from './ResourceNumber';
import {
  ImageListQuery,
  ImageListQuery$data,
} from './__generated__/ImageListQuery.graphql';
import {
  AppstoreOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { Button, Table, Tag, theme } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { Key, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

export type EnvironmentImage = NonNullable<
  ImageListQuery$data['images']
>[number];

export default function ImageList() {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [metadata] = useBackendAIImageMetaData();
  const [, { getNamespace, getBaseVersion }] = useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const [managingApp, setManagingApp] = useState<EnvironmentImage | null>(null);
  const [managingResourceLimit, setManagingResourceLimit] =
    useState<EnvironmentImage | null>(null);
  const [isOpenInstallModal, setIsOpenInstallModal] = useState<boolean>(false);
  const [environmentFetchKey, updateEnvironmentFetchKey] =
    useUpdatableState('initial-fetch');
  const [, startRefetchTransition] = useTransition();

  const onSelectChange = (newSelectedRowKeys: Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const getEnvironmentLang = (image: EnvironmentImage) => {
    const environmentName = image?.registry + '/' + image?.name;
    const imageKey = environmentName.split('/')?.[2];
    const displayName = imageKey && metadata?.imageInfo[imageKey]?.name;
    return displayName || _.last(environmentName.split('/'));
  };

  const getEnvironmentBaseImage = (image: EnvironmentImage) => {
    const [, tag] = image?.tag?.split('-') || ['', ''];
    return metadata?.tagAlias[tag];
  };

  const sortBasedOnInstalled = (a: EnvironmentImage, b: EnvironmentImage) => {
    return a?.installed && !b?.installed
      ? -1
      : !a?.installed && b?.installed
        ? 1
        : 0;
  };

  const { images } = useLazyLoadQuery<ImageListQuery>(
    graphql`
      query ImageListQuery {
        images {
          id
          name
          tag
          registry
          architecture
          digest
          installed
          labels {
            key
            value
          }
          resource_limits {
            key
            min
            max
          }
        }
      }
    `,
    {},
    {
      fetchPolicy:
        environmentFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey: environmentFetchKey,
    },
  );

  const sortedImages = useMemo(
    () =>
      images
        ? ([...images].sort(sortBasedOnInstalled) as readonly AnyObject[])
        : undefined,
    [images],
  );
  const columns: ColumnsType<EnvironmentImage> = [
    {
      title: t('environment.Status'),
      dataIndex: 'installed',
      key: 'installed',
      sorter: sortBasedOnInstalled,
      render: (text, row) =>
        row?.installed ? (
          <Tag color="gold">{t('environment.Installed')}</Tag>
        ) : null,
    },
    {
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: (a, b) =>
        a?.registry && b?.registry ? a.registry.localeCompare(b.registry) : 0,
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: (a, b) =>
        a?.architecture && b?.architecture
          ? a.architecture.localeCompare(b.architecture)
          : 0,
    },
    {
      title: t('environment.Namespace'),
      key: 'namespace',
      dataIndex: 'namespace',
      sorter: (a, b) => {
        const namespaceA = getNamespace(getImageFullName(a) || '');
        const namespaceB = getNamespace(getImageFullName(b) || '');
        return namespaceA && namespaceB
          ? namespaceA.localeCompare(namespaceB)
          : 0;
      },
      render: (text, row) => (
        <span>{getNamespace(getImageFullName(row) || '')}</span>
      ),
    },
    {
      title: t('environment.Language'),
      key: 'lang',
      dataIndex: 'lang',
      sorter: (a, b) => {
        const langA = getEnvironmentLang(a);
        const langB = getEnvironmentLang(b);
        return langA && langB ? langA.localeCompare(langB) : 0;
      },
      render: (text, row) => {
        return <span>{getEnvironmentLang(row)}</span>;
      },
    },
    {
      title: t('environment.Version'),
      key: 'baseversion',
      dataIndex: 'baseversion',
      sorter: (a, b) => {
        const baseversionA = getBaseVersion(getImageFullName(a) || '');
        const baseversionB = getBaseVersion(getImageFullName(b) || '');
        return baseversionA && baseversionB
          ? baseversionA.localeCompare(baseversionB)
          : 0;
      },
      render: (text, row) => (
        <span>{getBaseVersion(getImageFullName(row) || '')}</span>
      ),
    },
    {
      title: t('environment.Base'),
      key: 'baseimage',
      dataIndex: 'baseimage',
      sorter: (a, b) => {
        const baseimageA = getEnvironmentBaseImage(a) || '';
        const baseimageB = getEnvironmentBaseImage(b) || '';
        if (baseimageA === '' && baseimageB === '') return 0;
        if (baseimageA === '') return -1;
        if (baseimageB === '') return 1;
        return baseimageA.localeCompare(baseimageB);
      },
      render: (text, row) => {
        const baseImage = getEnvironmentBaseImage(row);
        if (!baseImage) return null;
        return <Tag color="green">{getEnvironmentBaseImage(row)}</Tag>;
      },
    },
    {
      title: t('environment.Constraint'),
      key: 'constraint',
      dataIndex: 'constraint',
      sorter: (a, b) => {
        const [, , ...requirementsA] = a?.tag?.split('-') || ['', '', ''];
        const [, , ...requirementsB] = b?.tag?.split('-') || ['', '', ''];
        const requirementA = requirementsA.join('');
        const requirementB = requirementsB.join('');
        if (requirementA === '' && requirementB === '') return 0;
        if (requirementA === '') return -1;
        if (requirementB === '') return 1;
        return requirementA.localeCompare(requirementB);
      },
      render: (text, row) => (
        <ConstraintTags
          image={getImageFullName(row) || ''}
          labels={row?.labels as { key: string; value: string }[]}
        />
      ),
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) =>
        a?.digest && b?.digest ? a.digest.localeCompare(b.digest) : 0,
    },
    {
      title: t('environment.ResourceLimit'),
      dataIndex: 'resource_limits',
      key: 'resource_limits',
      render: (text, row) =>
        row?.resource_limits?.map((resource_limit) => (
          <ResourceNumber
            // @ts-ignore
            type={resource_limit.key}
            value={resource_limit?.min || '0'}
            max={resource_limit?.max || ''}
          />
        )),
    },
    {
      title: t('general.Control'),
      key: 'control',
      dataIndex: 'control',
      fixed: 'right',
      render: (text, row) => {
        return (
          <>
            <Flex direction="row" align="stretch" justify="center" gap="xxs">
              <Button
                type="text"
                icon={
                  <SettingOutlined
                    style={{
                      color: token.colorInfo,
                    }}
                  />
                }
                onClick={() => setManagingResourceLimit(row)}
              />
              <Button
                type="text"
                icon={
                  <AppstoreOutlined
                    style={{
                      color: token.colorInfo,
                    }}
                  />
                }
                onClick={() => {
                  setManagingApp(row);
                }}
              />
            </Flex>
          </>
        );
      },
    },
  ];

  return (
    <>
      <Flex justify="end" style={{ height: '3rem', padding: '.5rem 1rem' }}>
        <Button
          size="middle"
          icon={<VerticalAlignBottomOutlined />}
          style={{ backgroundColor: token.colorPrimary, color: 'white' }}
          onClick={() => {
            setIsOpenInstallModal(true);
          }}
        >
          {t('environment.Install')}
        </Button>
      </Flex>
      <Table
        rowKey="id"
        scroll={{ x: '100vw', y: 'calc(100vh - (9.0625rem + 3rem + 4.5rem))' }}
        pagination={false}
        dataSource={sortedImages}
        columns={columns as ColumnType<AnyObject>[]}
        rowSelection={rowSelection}
      />
      <ManageImageResourceLimitModal
        open={!!managingResourceLimit}
        onRequestClose={(success) => {
          setManagingResourceLimit(null);
          if (success)
            startRefetchTransition(() => {
              updateEnvironmentFetchKey();
            });
        }}
        image={managingResourceLimit}
      />
      <ManageAppsModal
        open={!!managingApp}
        onRequestClose={(success) => {
          setManagingApp(null);
          if (success)
            startRefetchTransition(() => {
              updateEnvironmentFetchKey();
            });
        }}
        image={managingApp}
      />
      <ImageInstallModal
        open={isOpenInstallModal}
        onRequestClose={(success) => {
          setIsOpenInstallModal(false);
        }}
        selectedRowKeys={selectedRowKeys}
        images={images as EnvironmentImage[]}
      />
    </>
  );
}
