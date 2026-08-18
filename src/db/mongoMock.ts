export interface MongoRecord {
  _id: string;
  [key: string]: any;
}

export class InMemoryMongoDatabase {
  private collections: Map<string, Map<string, MongoRecord[]>> = new Map();

  constructor() {
    // Seed default NetworkSecurity.NetworkData collection
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const defaultRecords: MongoRecord[] = [
      {
        _id: 'rec_01',
        having_IP_Address: 1,
        URL_Length: -1,
        Shortining_Service: 1,
        having_At_Symbol: 1,
        double_slash_redirecting: 1,
        Prefix_Suffix: -1,
        having_Sub_Domain: 1,
        SSLfinal_State: 1,
        Domain_registeration_length: 1,
        Favicon: 1,
        port: 1,
        HTTPS_token: -1,
        Request_URL: -1,
        URL_of_Anchor: 1,
        Links_in_tags: 1,
        SFH: 0,
        Submitting_to_email: 1,
        Abnormal_URL: 1,
        Redirect: 0,
        on_mouseover: 1,
        RightClick: 1,
        popUpWidnow: 1,
        Iframe: 1,
        age_of_domain: 1,
        DNSRecord: 1,
        web_traffic: -1,
        Page_Rank: -1,
        Google_Index: 1,
        Links_pointing_to_page: 1,
        Statistical_report: 1,
        Result: 1
      },
      {
        _id: 'rec_02',
        having_IP_Address: -1,
        URL_Length: -1,
        Shortining_Service: -1,
        having_At_Symbol: 1,
        double_slash_redirecting: -1,
        Prefix_Suffix: 1,
        having_Sub_Domain: 1,
        SSLfinal_State: 1,
        Domain_registeration_length: -1,
        Favicon: 1,
        port: 1,
        HTTPS_token: -1,
        Request_URL: 1,
        URL_of_Anchor: 1,
        Links_in_tags: 0,
        SFH: 1,
        Submitting_to_email: 1,
        Abnormal_URL: -1,
        Redirect: 0,
        on_mouseover: 1,
        RightClick: 1,
        popUpWidnow: 1,
        Iframe: 1,
        age_of_domain: -1,
        DNSRecord: -1,
        web_traffic: 1,
        Page_Rank: 1,
        Google_Index: -1,
        Links_pointing_to_page: 1,
        Statistical_report: 1,
        Result: 1
      },
      {
        _id: 'rec_03',
        having_IP_Address: -1,
        URL_Length: -1,
        Shortining_Service: -1,
        having_At_Symbol: 1,
        double_slash_redirecting: -1,
        Prefix_Suffix: -1,
        having_Sub_Domain: 0,
        SSLfinal_State: 0,
        Domain_registeration_length: 1,
        Favicon: 1,
        port: 1,
        HTTPS_token: -1,
        Request_URL: -1,
        URL_of_Anchor: -1,
        Links_in_tags: 1,
        SFH: -1,
        Submitting_to_email: 1,
        Abnormal_URL: -1,
        Redirect: 1,
        on_mouseover: 1,
        RightClick: 1,
        popUpWidnow: 1,
        Iframe: 1,
        age_of_domain: 1,
        DNSRecord: 1,
        web_traffic: -1,
        Page_Rank: -1,
        Google_Index: 1,
        Links_pointing_to_page: 0,
        Statistical_report: 1,
        Result: -1
      },
      {
        _id: 'rec_04',
        having_IP_Address: 1,
        URL_Length: 1,
        Shortining_Service: 1,
        having_At_Symbol: 1,
        double_slash_redirecting: 1,
        Prefix_Suffix: -1,
        having_Sub_Domain: 0,
        SSLfinal_State: -1,
        Domain_registeration_length: -1,
        Favicon: 1,
        port: 1,
        HTTPS_token: 1,
        Request_URL: 1,
        URL_of_Anchor: 0,
        Links_in_tags: 0,
        SFH: 1,
        Submitting_to_email: 1,
        Abnormal_URL: 1,
        Redirect: 0,
        on_mouseover: 1,
        RightClick: 1,
        popUpWidnow: 1,
        Iframe: 1,
        age_of_domain: -1,
        DNSRecord: 1,
        web_traffic: 1,
        Page_Rank: -1,
        Google_Index: 1,
        Links_pointing_to_page: 0,
        Statistical_report: 1,
        Result: 1
      },
      {
        _id: 'rec_05',
        having_IP_Address: 1,
        URL_Length: -1,
        Shortining_Service: 1,
        having_At_Symbol: 1,
        double_slash_redirecting: 1,
        Prefix_Suffix: 1,
        having_Sub_Domain: 0,
        SSLfinal_State: -1,
        Domain_registeration_length: -1,
        Favicon: 1,
        port: 1,
        HTTPS_token: 1,
        Request_URL: 1,
        URL_of_Anchor: 0,
        Links_in_tags: 0,
        SFH: -1,
        Submitting_to_email: 1,
        Abnormal_URL: 1,
        Redirect: 0,
        on_mouseover: 1,
        RightClick: 1,
        popUpWidnow: 1,
        Iframe: 1,
        age_of_domain: 1,
        DNSRecord: 1,
        web_traffic: 1,
        Page_Rank: -1,
        Google_Index: 1,
        Links_pointing_to_page: 0,
        Statistical_report: 1,
        Result: 1
      }
    ];

    this.insertMany('NetworkSecurity', 'NetworkData', defaultRecords);
    this.insertMany('KRISHAI', 'NetworkData', defaultRecords);
  }

  public insertMany(database: string, collection: string, records: any[]): number {
    if (!this.collections.has(database)) {
      this.collections.set(database, new Map());
    }
    const db = this.collections.get(database)!;
    if (!db.has(collection)) {
      db.set(collection, []);
    }
    const coll = db.get(collection)!;
    const formatted = records.map((r, i) => ({
      _id: r._id || `id_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      ...r,
      insertedAt: new Date().toISOString()
    }));
    coll.push(...formatted);
    return formatted.length;
  }

  public find(database: string, collection: string, limit = 100): MongoRecord[] {
    const db = this.collections.get(database);
    if (!db) return [];
    const coll = db.get(collection);
    if (!coll) return [];
    return coll.slice(0, limit);
  }

  public count(database: string, collection: string): number {
    const db = this.collections.get(database);
    if (!db) return 0;
    const coll = db.get(collection);
    return coll ? coll.length : 0;
  }
}

export const mongoMock = new InMemoryMongoDatabase();
