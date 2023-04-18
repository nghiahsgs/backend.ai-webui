import { useState } from "react";
import { CheckOutlined, WarningOutlined } from "@ant-design/icons";
import { Descriptions, Typography, Tag, Card } from "antd";
import { useWebComponentInfo } from "./DefaultProviders";
import { useTranslation, Trans } from "react-i18next";
import Flex from "./Flex";

const { Text } = Typography;

interface InformationProps {}
const Information: React.FC<InformationProps> = () => {
  const [accountChanged, setAccountChanged] = useState(true);
  const [useSsl, setUseSsl] = useState(true);
  const [licenseValid, setLicenseValid] = useState(false);
  const [licenseType, setLicenseType] = useState('information.CannotRead');
  const [licensee, setLicensee] = useState('information.CannotRead');
  const [licenseKey, setLicenseKey] = useState('information.CannotRead');
  const [licenseExpiration, setLicenseExpiration] = useState('information.CannotRead');

  const { t } = useTranslation();
  const {
    props: { value },
  } = useWebComponentInfo();
  return (
    <>
      <Card style={{ margin: '20px' }}>
        <Descriptions
          title={t('information.Core')}
          bordered
        >
          <Descriptions.Item label={t('information.ManagerVersion')}>
            <Flex>
              Backend.AI 
            </Flex>
            <Flex direction="row" style={{ margin: '5px auto' }}>
              <Tag style={{ margin: 0 }}>{t('information.Installation')}</Tag>
              <Tag color="green">manager_version</Tag>
            </Flex>
            <Flex style={{ margin: '5px auto' }}>
              <Tag style={{ margin: 0 }}>{t('information.LatestRelease')}</Tag>
              <Tag color="green">manager_version_latest</Tag>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.APIVersion')}>
            <Flex>api_version</Flex>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card style={{ margin: '20px' }}>
        <Descriptions
          title={t('information.Security')}
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }}
        >
          <Descriptions.Item label={t('information.DefaultAdministratorAccountChanged')}>
            <Flex>
              {accountChanged ? <CheckOutlined /> : <WarningOutlined />}
              <Trans>
                {t('information.DescDefaultAdministratorAccountChanged')}          
              </Trans>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.UsesSSL')}>
            <Flex>
              {useSsl ? <CheckOutlined /> : <WarningOutlined />}
              <Trans>
                {t('information.DescUsesSSL')}
              </Trans>
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card style={{ margin: '20px' }}>
        <Descriptions
          title={t('information.Component')}
          bordered
          column={2}
        >
          <Descriptions.Item label={t('information.DockerVersion')}>
            <Flex>
              <Tag>{t('information.Compatible')}</Tag>
              <Trans>
                {t('information.DescDockerVersion')}
              </Trans>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.PostgreSQLVersion')}>
            <Flex>
              <Tag>{t('information.Compatible')}</Tag>
              <Trans>
                {t('information.DescPostgreSQLVersion')}
              </Trans>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.ETCDVersion')}>
            <Flex>
              <Tag>{t('information.Compatible')}</Tag>
              <Trans>
                {t('information.DescETCDVersion')}
              </Trans>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.RedisVersion')}>
            <Flex>
              <Tag>{t('information.Compatible')}</Tag>
              <Trans>
                {t('information.DescRedisVersion')}
              </Trans>
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card style={{ margin: '20px' }}>
        <Descriptions
          title={t('information.License')}
          bordered
          column={2}
        >
          <Descriptions.Item label={t('information.IsLicenseValid')}>
            <Flex>
              {licenseValid ? <CheckOutlined /> : <WarningOutlined />}
              <Trans>
                {t('information.DescIsLicenseValid')}
              </Trans>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.LicenseType')}>
            <Flex>
              <Tag>{licenseType ? t('information.FixedLicense') : t('information.DynamicLicense')}</Tag>
              <Trans>
                {t('information.DescLicenseType')}
              </Trans>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.Licensee')}>
            <Flex>
              <Tag>{licensee}</Tag>
              <Trans>
                {t('information.DescLicensee')}
              </Trans>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.LicenseKey')}>
            <Flex>
              <Tag>{licenseKey}</Tag>
              <Trans>
                {t('information.DescLicenseKey')}
              </Trans>
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('information.Expiration')}>
            <Flex>
              <Tag>{licenseExpiration}</Tag>
              <Trans>
                {t('information.DescExpiration')}
              </Trans>
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
};

export default Information;