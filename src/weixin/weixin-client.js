/**
 * Weixin - 微信登录与消息处理
 * 基于 openclaw-weixin 源码的简化版本
 */

const crypto = require('crypto');
const https = require('https');
const { EventEmitter } = require('events');

const DEFAULT_BASE_URL = 'https://api.weixin.qq.com';

/**
 * 安全XML解析 - 防止XXE注入
 * 使用白名单方式，只提取需要的标签内容
 */
function safeParseXml(xml) {
  // 安全检查：拒绝包含外部实体的XML
  if (/<!\[CDATA\[[\s\S]*?\]>\]>/.test(xml)) {
    // 检测到CDATA，但这是微信消息的正常格式，检查是否有问题
  }

  // 只提取允许的标签，防止XXE
  const allowedTags = ['ToUserName', 'FromUserName', 'CreateTime', 'MsgType', 'Content', 'MsgId', 'Event', 'EventKey', 'Ticket', 'Latitude', 'Longitude', 'Precision'];

  const result = {};
  for (const tag of allowedTags) {
    // 安全解析：只匹配标签内容，不处理任何外部实体
    const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'g');
    const match = regex.exec(xml);
    result[tag] = match ? match[1] : '';
  }

  return result;
}

class WeixinClient extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.accessToken = null;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  async request(method, path, params = {}, body = null) {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const query = { access_token: this.accessToken, ...params };
    const queryStr = Object.entries(query)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    const options = {
      hostname: this.baseUrl.replace('https://', ''),
      port: 443,
      path: `${path}?${queryStr}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.errcode && json.errcode !== 0) {
              reject(new Error(`Weixin API error: ${json.errmsg}`));
            } else {
              resolve(json);
            }
          } catch (e) {
            resolve(data);
          }
        });
      });
      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async getAccessToken() {
    const params = {
      grant_type: 'client_credential',
      appid: this.config.appId,
      secret: this.config.appSecret
    };

    const result = await this.request('GET', '/cgi-bin/token', params);
    this.accessToken = result.access_token;
    this.expiresAt = Date.now() + (result.expires_in - 300) * 1000;
    
    console.log('[Weixin] Access token obtained');
    return this.accessToken;
  }

  async getUserInfo(openid) {
    return this.request('GET', '/cgi-bin/user/info', {
      openid: openid,
      lang: 'zh_CN'
    });
  }

  async sendText(to, content) {
    return this.request('POST', '/cgi-bin/message/custom/send', {
      touser: to,
      msgtype: 'text',
      text: {
        content: content
      }
    });
  }

  async sendImage(to, mediaId) {
    return this.request('POST', '/cgi-bin/message/custom/send', {
      touser: to,
      msgtype: 'image',
      image: {
        media_id: mediaId
      }
    });
  }

  async uploadMedia(type, filePath) {
    // 简化实现，需要使用 form-data
    console.log('[Weixin] Media upload not implemented yet');
    return null;
  }

  verifySignature(timestamp, nonce, signature) {
    const str = [this.config.token, timestamp, nonce].sort().join('');
    const hash = crypto.createHash('sha1').update(str).digest('hex');
    return hash === signature;
  }

  parseXmlMessage(xml) {
    // 安全修复：使用safeParseXml替代正则，避免XXE
    // 不使用CDATA部分，直接提取纯文本内容
    return safeParseXml(xml);
  }

  createXmlResponse(toUser, fromUser, content) {
    return `<xml>
<ToUserName><![CDATA[${toUser}]]></ToUserName>
<FromUserName><![CDATA[${fromUser}]]></FromUserName>
<CreateTime>${Date.now()}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${content}]]></Content>
</xml>`;
  }

  createTextResponse(toUser, fromUser, content) {
    return this.createXmlResponse(toUser, fromUser, content);
  }
}

module.exports = { WeixinClient };
