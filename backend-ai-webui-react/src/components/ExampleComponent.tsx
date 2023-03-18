import {
  Alert,
  Button,
  Drawer,
  message,
  Modal,
  Select,
  theme,
  Tooltip,
  Typography,
} from "antd";
//@ts-ignore
import customCss from "./ExampleComponent.css?raw";
import { useEffect, useState } from "react";
import Flex from "./Flex";
import { useWebComponentInfo } from "../helper";

const SampleComponent: React.FC<{
  value?: string;
  dispatchEvent?: (name: string, detail: any) => void;
}> = ({ value, dispatchEvent }) => {
  useEffect(() => {
    message.success("hello");
  }, []);
  const [open, setOpen] = useState(false);
  const [isOpenedDrawer, setIsOpenedDrawer] = useState(false);
  const { token } = theme.useToken();
  const {
    props: { shadowRoot },
  } = useWebComponentInfo();
  console.log("rendering;");
  return (
    <Flex
      direction="column"
      style={{
        gap: token.paddingSM,
        border: "1px solid gray",
        padding: 20,
        borderRadius: 10,
      }}
    >
      <style>{customCss}</style>
      <Typography.Title level={2}>React in Lit</Typography.Title>
      <h1>Lit</h1>
      <Tooltip title="hello">
        <Button
          onClick={() => {
            dispatchEvent && dispatchEvent("my", { value: "hello" });
          }}
        >
          Trigger an event from react to lit
        </Button>
      </Tooltip>
      <Select
        options={[
          { label: "option2", value: "option2" },
          { label: "option1", value: "option1" },
        ]}
        placeholder="please select one"
      ></Select>
      <Alert
        message={`I got from a string via 'value' attribute of component : ${typeof value} / ${value}`}
      />
      <div className="hello">With Custom CSS style (gray BG)</div>
      <div
        style={{
          backgroundColor: "lightblue",
        }}
      >
        Inline style (lightblue BG)
      </div>
      <Button onClick={() => setOpen((v) => !v)} type={"primary"}>
        Open Modal
      </Button>
      <Button onClick={() => setIsOpenedDrawer((v) => !v)} type={"primary"}>
        Open Drawer
      </Button>
      <Modal
        title="hello"
        open={open}
        onCancel={() => setOpen((v) => !v)}
        onOk={() => setOpen((v) => !v)}
      >
        hello
      </Modal>
      <Drawer
        open={isOpenedDrawer}
        title="This is drawer"
        onClose={() => setIsOpenedDrawer((v) => !v)}
        getContainer={shadowRoot}
      >
        <Button>hello</Button>
      </Drawer>
    </Flex>
  );
};

export default SampleComponent;
