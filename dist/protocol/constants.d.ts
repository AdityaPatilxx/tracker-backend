export declare const START_FLAG: Buffer<ArrayBuffer>;
export declare const START_FLAG_LEN = 2;
export declare const HEADER_LEN = 28;
export declare const CRC_LEN = 2;
export declare const MIN_PACKET_LEN: number;
export declare const CMD: {
    readonly REGISTER: 8;
    readonly LOGIN: 1;
    readonly HEARTBEAT: 3;
    readonly DATA_REPORT: 4;
    readonly FIRMWARE_UPDATE: 13;
    readonly CONFIG: 10;
};
export declare const RES: {
    readonly REGISTER: 32776;
    readonly LOGIN: 32769;
    readonly HEARTBEAT: 32771;
    readonly DATA_REPORT: 32772;
    readonly FIRMWARE_UPDATE: 32781;
    readonly CONFIG: 32778;
};
export declare const REG_STATUS: {
    readonly SUCCESS: 0;
    readonly CODE_ERROR: 254;
    readonly REFUSED: 255;
};
export declare const LOGIN_STATUS: {
    readonly SUCCESS: 0;
    readonly SUCCESS_UPDATE_FIRMWARE: 2;
    readonly SUCCESS_GET_HW_INFO: 3;
    readonly SUCCESS_UPDATE_CONFIG: 16;
    readonly ERROR: 254;
    readonly REFUSED: 255;
};
export declare const HEARTBEAT_OP: {
    readonly NONE: 0;
    readonly UPDATE_FIRMWARE: 2;
    readonly RESET_DEVICE: 3;
    readonly UPDATE_ANT_FIRMWARE: 4;
    readonly GET_ANT_INFO: 5;
    readonly SET_DEVICE_TIME: 6;
    readonly CLEAR_TAG_BUFFER: 8;
    readonly UPDATE_USER_CONFIG: 16;
    readonly GET_DEVICE_STATUS: 17;
    readonly GET_HW_INFO: 18;
};
export declare const DEVICE_TYPE: {
    readonly DATA_GATEWAY: 1;
    readonly RFID_READER: 2;
    readonly COMPUTER: 3;
};
export declare const TLV_TYPE: {
    readonly RFID_ITEM_MONITOR: 34817;
    readonly CURRENT_TAG: 35073;
    readonly WRISTBAND_TAG: 35329;
    readonly TAG: 35585;
    readonly ATTENDANCE_TAG: 35586;
};
export declare const TAG_TYPE: {
    readonly STUDENT_CARD: 32;
    readonly EBIKE_TAG: 48;
    readonly EBIKE_KEY_CARD: 49;
};
export declare const CONFIG_PARAM: {
    readonly ANTENNA_INFO: 2;
    readonly TAG_REPORT_FLAG: 3;
    readonly USER_CONFIG: 16;
    readonly DEVICE_STATUS: 17;
    readonly HW_INFO: 18;
    readonly CONFIG_CONFIRM: 128;
};
export declare const PROTOCOL_VERSION = 1;
export declare const SEC_FLAG_NONE = 0;
export declare const FIRMWARE_DATA_TYPE: {
    readonly FILE_INFO: 0;
    readonly FILE_CONTENT: 1;
    readonly COMPLETE: 2;
};
export declare const FIRMWARE_FILE_TYPE: {
    readonly HOST: 1;
    readonly ANTENNA: 2;
};
export declare const OFFSET: {
    readonly START_FLAG: 0;
    readonly LEN: 2;
    readonly CMD: 4;
    readonly SEQ: 6;
    readonly VERSION: 10;
    readonly SEC_FLAG: 12;
    readonly DEVICE_ID: 14;
    readonly PAYLOAD: 30;
};
//# sourceMappingURL=constants.d.ts.map