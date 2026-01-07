// Ghana Administrative Divisions Data
// Regions -> Constituencies -> Districts

export interface District {
  name: string;
}

export interface Constituency {
  name: string;
  districts: District[];
}

export interface Region {
  name: string;
  constituencies: Constituency[];
}

export const ghanaRegions: Region[] = [
  {
    name: "Greater Accra",
    constituencies: [
      {
        name: "Accra Central",
        districts: [
          { name: "Accra Metropolitan" },
        ],
      },
      {
        name: "Ablekuma South",
        districts: [
          { name: "Ablekuma South Municipal" },
        ],
      },
      {
        name: "Ablekuma North",
        districts: [
          { name: "Ablekuma North Municipal" },
        ],
      },
      {
        name: "Ablekuma West",
        districts: [
          { name: "Ablekuma West Municipal" },
        ],
      },
      {
        name: "Ayawaso Central",
        districts: [
          { name: "Ayawaso Central Municipal" },
        ],
      },
      {
        name: "Ayawaso East",
        districts: [
          { name: "Ayawaso East Municipal" },
        ],
      },
      {
        name: "Ayawaso North",
        districts: [
          { name: "Ayawaso North Municipal" },
        ],
      },
      {
        name: "Ayawaso West",
        districts: [
          { name: "Ayawaso West Municipal" },
        ],
      },
      {
        name: "Okaikwei Central",
        districts: [
          { name: "Okaikwei North Municipal" },
        ],
      },
      {
        name: "Okaikwei North",
        districts: [
          { name: "Okaikwei North Municipal" },
        ],
      },
      {
        name: "Tema Central",
        districts: [
          { name: "Tema Metropolitan" },
        ],
      },
      {
        name: "Tema East",
        districts: [
          { name: "Tema Metropolitan" },
        ],
      },
      {
        name: "Tema West",
        districts: [
          { name: "Tema West Municipal" },
        ],
      },
      {
        name: "Ashaiman",
        districts: [
          { name: "Ashaiman Municipal" },
        ],
      },
      {
        name: "Krowor",
        districts: [
          { name: "Krowor Municipal" },
        ],
      },
      {
        name: "Ledzokuku",
        districts: [
          { name: "Ledzokuku Municipal" },
        ],
      },
      {
        name: "Dade Kotopon",
        districts: [
          { name: "La Dade Kotopon Municipal" },
        ],
      },
      {
        name: "La Nkwantanang Madina",
        districts: [
          { name: "La Nkwantanang Madina Municipal" },
        ],
      },
      {
        name: "Adentan",
        districts: [
          { name: "Adentan Municipal" },
        ],
      },
      {
        name: "Madina",
        districts: [
          { name: "La Nkwantanang Madina Municipal" },
        ],
      },
      {
        name: "Amasaman",
        districts: [
          { name: "Ga West Municipal" },
        ],
      },
      {
        name: "Trobu",
        districts: [
          { name: "Ga North Municipal" },
        ],
      },
      {
        name: "Dome Kwabenya",
        districts: [
          { name: "Ga East Municipal" },
        ],
      },
      {
        name: "Weija Gbawe",
        districts: [
          { name: "Weija Gbawe Municipal" },
        ],
      },
      {
        name: "Bortianor Ngleshie Amanfro",
        districts: [
          { name: "Ga South Municipal" },
        ],
      },
      {
        name: "Ada",
        districts: [
          { name: "Ada East District" },
          { name: "Ada West District" },
        ],
      },
      {
        name: "Shai Osudoku",
        districts: [
          { name: "Shai Osudoku District" },
        ],
      },
      {
        name: "Ningo Prampram",
        districts: [
          { name: "Ningo Prampram District" },
        ],
      },
      {
        name: "Kpone Katamanso",
        districts: [
          { name: "Kpone Katamanso Municipal" },
        ],
      },
    ],
  },
  {
    name: "Ashanti",
    constituencies: [
      {
        name: "Kumasi Central",
        districts: [
          { name: "Kumasi Metropolitan" },
        ],
      },
      {
        name: "Manhyia North",
        districts: [
          { name: "Kumasi Metropolitan" },
        ],
      },
      {
        name: "Manhyia South",
        districts: [
          { name: "Kumasi Metropolitan" },
        ],
      },
      {
        name: "Subin",
        districts: [
          { name: "Kumasi Metropolitan" },
        ],
      },
      {
        name: "Bantama",
        districts: [
          { name: "Kumasi Metropolitan" },
        ],
      },
      {
        name: "Nhyiaeso",
        districts: [
          { name: "Kumasi Metropolitan" },
        ],
      },
      {
        name: "Kwadaso",
        districts: [
          { name: "Kwadaso Municipal" },
        ],
      },
      {
        name: "Old Tafo",
        districts: [
          { name: "Old Tafo Municipal" },
        ],
      },
      {
        name: "Suame",
        districts: [
          { name: "Suame Municipal" },
        ],
      },
      {
        name: "Asokwa",
        districts: [
          { name: "Asokwa Municipal" },
        ],
      },
      {
        name: "Oforikrom",
        districts: [
          { name: "Oforikrom Municipal" },
        ],
      },
      {
        name: "Asawase",
        districts: [
          { name: "Asokore Mampong Municipal" },
        ],
      },
      {
        name: "Ejisu",
        districts: [
          { name: "Ejisu Municipal" },
        ],
      },
      {
        name: "Juaben",
        districts: [
          { name: "Ejisu Municipal" },
        ],
      },
      {
        name: "Bekwai",
        districts: [
          { name: "Bekwai Municipal" },
        ],
      },
      {
        name: "Obuasi East",
        districts: [
          { name: "Obuasi Municipal" },
        ],
      },
      {
        name: "Obuasi West",
        districts: [
          { name: "Obuasi Municipal" },
        ],
      },
      {
        name: "Mampong",
        districts: [
          { name: "Mampong Municipal" },
        ],
      },
      {
        name: "Effiduase Asokore",
        districts: [
          { name: "Sekyere East District" },
        ],
      },
      {
        name: "Afigya Kwabre North",
        districts: [
          { name: "Afigya Kwabre North District" },
        ],
      },
      {
        name: "Afigya Kwabre South",
        districts: [
          { name: "Afigya Kwabre South District" },
        ],
      },
      {
        name: "Atwima Nwabiagya North",
        districts: [
          { name: "Atwima Nwabiagya North District" },
        ],
      },
      {
        name: "Atwima Nwabiagya South",
        districts: [
          { name: "Atwima Nwabiagya Municipal" },
        ],
      },
      {
        name: "Atwima Kwanwoma",
        districts: [
          { name: "Atwima Kwanwoma District" },
        ],
      },
      {
        name: "Bosomtwe",
        districts: [
          { name: "Bosomtwe District" },
        ],
      },
      {
        name: "Bosome Freho",
        districts: [
          { name: "Bosome Freho District" },
        ],
      },
      {
        name: "Adansi Asokwa",
        districts: [
          { name: "Adansi South District" },
        ],
      },
      {
        name: "Adansi North",
        districts: [
          { name: "Adansi North District" },
        ],
      },
      {
        name: "New Edubiase",
        districts: [
          { name: "Adansi South District" },
        ],
      },
      {
        name: "Asante Akim Central",
        districts: [
          { name: "Asante Akim Central Municipal" },
        ],
      },
      {
        name: "Asante Akim North",
        districts: [
          { name: "Asante Akim North District" },
        ],
      },
      {
        name: "Asante Akim South",
        districts: [
          { name: "Asante Akim South District" },
        ],
      },
      {
        name: "Sekyere Afram Plains",
        districts: [
          { name: "Sekyere Afram Plains District" },
        ],
      },
      {
        name: "Sekyere Central",
        districts: [
          { name: "Sekyere Central District" },
        ],
      },
      {
        name: "Sekyere Kumawu",
        districts: [
          { name: "Sekyere Kumawu District" },
        ],
      },
      {
        name: "Nsuta Kwamang Beposo",
        districts: [
          { name: "Sekyere Central District" },
        ],
      },
      {
        name: "Offinso North",
        districts: [
          { name: "Offinso North District" },
        ],
      },
      {
        name: "Offinso South",
        districts: [
          { name: "Offinso Municipal" },
        ],
      },
      {
        name: "Ahafo Ano North",
        districts: [
          { name: "Ahafo Ano North Municipal" },
        ],
      },
      {
        name: "Ahafo Ano South East",
        districts: [
          { name: "Ahafo Ano South East District" },
        ],
      },
      {
        name: "Ahafo Ano South West",
        districts: [
          { name: "Ahafo Ano South West District" },
        ],
      },
    ],
  },
  {
    name: "Western",
    constituencies: [
      {
        name: "Sekondi",
        districts: [
          { name: "Sekondi Takoradi Metropolitan" },
        ],
      },
      {
        name: "Takoradi",
        districts: [
          { name: "Sekondi Takoradi Metropolitan" },
        ],
      },
      {
        name: "Essikado Ketan",
        districts: [
          { name: "Sekondi Takoradi Metropolitan" },
        ],
      },
      {
        name: "Effia",
        districts: [
          { name: "Effia Kwesimintsim Municipal" },
        ],
      },
      {
        name: "Kwesimintsim",
        districts: [
          { name: "Effia Kwesimintsim Municipal" },
        ],
      },
      {
        name: "Shama",
        districts: [
          { name: "Shama District" },
        ],
      },
      {
        name: "Ahanta West",
        districts: [
          { name: "Ahanta West Municipal" },
        ],
      },
      {
        name: "Mpohor",
        districts: [
          { name: "Mpohor District" },
        ],
      },
      {
        name: "Tarkwa Nsuaem",
        districts: [
          { name: "Tarkwa Nsuaem Municipal" },
        ],
      },
      {
        name: "Prestea Huni Valley",
        districts: [
          { name: "Prestea Huni Valley Municipal" },
        ],
      },
      {
        name: "Wassa East",
        districts: [
          { name: "Wassa East District" },
        ],
      },
      {
        name: "Amenfi East",
        districts: [
          { name: "Amenfi East Municipal" },
        ],
      },
      {
        name: "Amenfi West",
        districts: [
          { name: "Amenfi West District" },
        ],
      },
      {
        name: "Amenfi Central",
        districts: [
          { name: "Amenfi Central District" },
        ],
      },
      {
        name: "Ellembelle",
        districts: [
          { name: "Ellembelle District" },
        ],
      },
      {
        name: "Evalue Ajomoro Gwira",
        districts: [
          { name: "Nzema East Municipal" },
        ],
      },
      {
        name: "Jomoro",
        districts: [
          { name: "Jomoro District" },
        ],
      },
    ],
  },
  {
    name: "Central",
    constituencies: [
      {
        name: "Cape Coast North",
        districts: [
          { name: "Cape Coast Metropolitan" },
        ],
      },
      {
        name: "Cape Coast South",
        districts: [
          { name: "Cape Coast Metropolitan" },
        ],
      },
      {
        name: "Abura Asebu Kwamankese",
        districts: [
          { name: "Abura Asebu Kwamankese District" },
        ],
      },
      {
        name: "Mfantseman",
        districts: [
          { name: "Mfantseman Municipal" },
        ],
      },
      {
        name: "Ekumfi",
        districts: [
          { name: "Ekumfi District" },
        ],
      },
      {
        name: "Ajumako Enyan Esiam",
        districts: [
          { name: "Ajumako Enyan Esiam District" },
        ],
      },
      {
        name: "Gomoa East",
        districts: [
          { name: "Gomoa East District" },
        ],
      },
      {
        name: "Gomoa West",
        districts: [
          { name: "Gomoa West District" },
        ],
      },
      {
        name: "Gomoa Central",
        districts: [
          { name: "Gomoa Central District" },
        ],
      },
      {
        name: "Effutu",
        districts: [
          { name: "Effutu Municipal" },
        ],
      },
      {
        name: "Awutu Senya East",
        districts: [
          { name: "Awutu Senya East Municipal" },
        ],
      },
      {
        name: "Awutu Senya West",
        districts: [
          { name: "Awutu Senya West District" },
        ],
      },
      {
        name: "Agona East",
        districts: [
          { name: "Agona East District" },
        ],
      },
      {
        name: "Agona West",
        districts: [
          { name: "Agona West Municipal" },
        ],
      },
      {
        name: "Asikuma Odoben Brakwa",
        districts: [
          { name: "Asikuma Odoben Brakwa District" },
        ],
      },
      {
        name: "Assin Central",
        districts: [
          { name: "Assin Central Municipal" },
        ],
      },
      {
        name: "Assin North",
        districts: [
          { name: "Assin North District" },
        ],
      },
      {
        name: "Assin South",
        districts: [
          { name: "Assin South District" },
        ],
      },
      {
        name: "Twifo Atti Morkwa",
        districts: [
          { name: "Twifo Atti Morkwa District" },
        ],
      },
      {
        name: "Hemang Lower Denkyira",
        districts: [
          { name: "Twifo Hemang Lower Denkyira District" },
        ],
      },
      {
        name: "Upper Denkyira East",
        districts: [
          { name: "Upper Denkyira East Municipal" },
        ],
      },
      {
        name: "Upper Denkyira West",
        districts: [
          { name: "Upper Denkyira West District" },
        ],
      },
      {
        name: "Komenda Edina Eguafo Abirem",
        districts: [
          { name: "Komenda Edina Eguafo Abirem Municipal" },
        ],
      },
    ],
  },
  {
    name: "Eastern",
    constituencies: [
      {
        name: "New Juaben North",
        districts: [
          { name: "New Juaben North Municipal" },
        ],
      },
      {
        name: "New Juaben South",
        districts: [
          { name: "New Juaben South Municipal" },
        ],
      },
      {
        name: "Akuapem North",
        districts: [
          { name: "Akuapem North Municipal" },
        ],
      },
      {
        name: "Akuapem South",
        districts: [
          { name: "Akuapem South District" },
        ],
      },
      {
        name: "Nsawam Adoagyiri",
        districts: [
          { name: "Nsawam Adoagyiri Municipal" },
        ],
      },
      {
        name: "Suhum",
        districts: [
          { name: "Suhum Municipal" },
        ],
      },
      {
        name: "Ayensuano",
        districts: [
          { name: "Ayensuano District" },
        ],
      },
      {
        name: "Akim Oda",
        districts: [
          { name: "Birim Central Municipal" },
        ],
      },
      {
        name: "Akim Swedru",
        districts: [
          { name: "Birim South District" },
        ],
      },
      {
        name: "Achiase",
        districts: [
          { name: "Achiase District" },
        ],
      },
      {
        name: "Ofoase Ayirebi",
        districts: [
          { name: "Birim South District" },
        ],
      },
      {
        name: "Abuakwa North",
        districts: [
          { name: "Abuakwa North Municipal" },
        ],
      },
      {
        name: "Abuakwa South",
        districts: [
          { name: "Abuakwa South Municipal" },
        ],
      },
      {
        name: "Atiwa East",
        districts: [
          { name: "Atiwa East District" },
        ],
      },
      {
        name: "Atiwa West",
        districts: [
          { name: "Atiwa West District" },
        ],
      },
      {
        name: "Fanteakwa North",
        districts: [
          { name: "Fanteakwa North District" },
        ],
      },
      {
        name: "Fanteakwa South",
        districts: [
          { name: "Fanteakwa South District" },
        ],
      },
      {
        name: "Yilo Krobo",
        districts: [
          { name: "Yilo Krobo Municipal" },
        ],
      },
      {
        name: "Lower Manya Krobo",
        districts: [
          { name: "Lower Manya Krobo Municipal" },
        ],
      },
      {
        name: "Upper Manya Krobo",
        districts: [
          { name: "Upper Manya Krobo District" },
        ],
      },
      {
        name: "Asuogyaman",
        districts: [
          { name: "Asuogyaman District" },
        ],
      },
      {
        name: "Afram Plains North",
        districts: [
          { name: "Afram Plains North District" },
        ],
      },
      {
        name: "Afram Plains South",
        districts: [
          { name: "Afram Plains South District" },
        ],
      },
      {
        name: "Kwahu East",
        districts: [
          { name: "Kwahu East District" },
        ],
      },
      {
        name: "Kwahu West",
        districts: [
          { name: "Kwahu West Municipal" },
        ],
      },
      {
        name: "Kwahu South",
        districts: [
          { name: "Kwahu South District" },
        ],
      },
      {
        name: "Mpraeso",
        districts: [
          { name: "Kwahu East District" },
        ],
      },
      {
        name: "Abetifi",
        districts: [
          { name: "Kwahu East District" },
        ],
      },
      {
        name: "Nkawkaw",
        districts: [
          { name: "Kwahu West Municipal" },
        ],
      },
      {
        name: "Denkyembour",
        districts: [
          { name: "Denkyembour District" },
        ],
      },
    ],
  },
  {
    name: "Volta",
    constituencies: [
      {
        name: "Ho Central",
        districts: [
          { name: "Ho Municipal" },
        ],
      },
      {
        name: "Ho West",
        districts: [
          { name: "Ho West District" },
        ],
      },
      {
        name: "Adaklu",
        districts: [
          { name: "Adaklu District" },
        ],
      },
      {
        name: "Agotime Ziope",
        districts: [
          { name: "Agotime Ziope District" },
        ],
      },
      {
        name: "North Tongu",
        districts: [
          { name: "North Tongu District" },
        ],
      },
      {
        name: "South Tongu",
        districts: [
          { name: "South Tongu District" },
        ],
      },
      {
        name: "Central Tongu",
        districts: [
          { name: "Central Tongu District" },
        ],
      },
      {
        name: "Keta",
        districts: [
          { name: "Keta Municipal" },
        ],
      },
      {
        name: "Ketu North",
        districts: [
          { name: "Ketu North Municipal" },
        ],
      },
      {
        name: "Ketu South",
        districts: [
          { name: "Ketu South Municipal" },
        ],
      },
      {
        name: "Akatsi North",
        districts: [
          { name: "Akatsi North District" },
        ],
      },
      {
        name: "Akatsi South",
        districts: [
          { name: "Akatsi South District" },
        ],
      },
      {
        name: "South Dayi",
        districts: [
          { name: "South Dayi District" },
        ],
      },
      {
        name: "North Dayi",
        districts: [
          { name: "North Dayi District" },
        ],
      },
      {
        name: "Afadjato South",
        districts: [
          { name: "Afadjato South District" },
        ],
      },
      {
        name: "Hohoe",
        districts: [
          { name: "Hohoe Municipal" },
        ],
      },
      {
        name: "Anlo",
        districts: [
          { name: "Anloga District" },
        ],
      },
    ],
  },
  {
    name: "Northern",
    constituencies: [
      {
        name: "Tamale Central",
        districts: [
          { name: "Tamale Metropolitan" },
        ],
      },
      {
        name: "Tamale North",
        districts: [
          { name: "Sagnarigu Municipal" },
        ],
      },
      {
        name: "Tamale South",
        districts: [
          { name: "Tamale Metropolitan" },
        ],
      },
      {
        name: "Sagnarigu",
        districts: [
          { name: "Sagnarigu Municipal" },
        ],
      },
      {
        name: "Tolon",
        districts: [
          { name: "Tolon District" },
        ],
      },
      {
        name: "Kumbungu",
        districts: [
          { name: "Kumbungu District" },
        ],
      },
      {
        name: "Savelugu",
        districts: [
          { name: "Savelugu Municipal" },
        ],
      },
      {
        name: "Nanton",
        districts: [
          { name: "Nanton District" },
        ],
      },
      {
        name: "Mion",
        districts: [
          { name: "Mion District" },
        ],
      },
      {
        name: "Yendi",
        districts: [
          { name: "Yendi Municipal" },
        ],
      },
      {
        name: "Gushegu",
        districts: [
          { name: "Gushegu Municipal" },
        ],
      },
      {
        name: "Karaga",
        districts: [
          { name: "Karaga District" },
        ],
      },
      {
        name: "Zabzugu",
        districts: [
          { name: "Zabzugu District" },
        ],
      },
      {
        name: "Tatale Sanguli",
        districts: [
          { name: "Tatale Sanguli District" },
        ],
      },
      {
        name: "Saboba",
        districts: [
          { name: "Saboba District" },
        ],
      },
      {
        name: "Chereponi",
        districts: [
          { name: "Chereponi District" },
        ],
      },
      {
        name: "Bimbilla",
        districts: [
          { name: "Nanumba North Municipal" },
        ],
      },
      {
        name: "Wulensi",
        districts: [
          { name: "Nanumba South District" },
        ],
      },
    ],
  },
  {
    name: "Upper East",
    constituencies: [
      {
        name: "Bolgatanga Central",
        districts: [
          { name: "Bolgatanga Municipal" },
        ],
      },
      {
        name: "Bolgatanga East",
        districts: [
          { name: "Bolgatanga East District" },
        ],
      },
      {
        name: "Bongo",
        districts: [
          { name: "Bongo District" },
        ],
      },
      {
        name: "Talensi",
        districts: [
          { name: "Talensi District" },
        ],
      },
      {
        name: "Nabdam",
        districts: [
          { name: "Nabdam District" },
        ],
      },
      {
        name: "Bawku Central",
        districts: [
          { name: "Bawku Municipal" },
        ],
      },
      {
        name: "Bawku West",
        districts: [
          { name: "Bawku West District" },
        ],
      },
      {
        name: "Binduri",
        districts: [
          { name: "Binduri District" },
        ],
      },
      {
        name: "Pusiga",
        districts: [
          { name: "Pusiga District" },
        ],
      },
      {
        name: "Garu",
        districts: [
          { name: "Garu District" },
        ],
      },
      {
        name: "Tempane",
        districts: [
          { name: "Tempane District" },
        ],
      },
      {
        name: "Builsa North",
        districts: [
          { name: "Builsa North Municipal" },
        ],
      },
      {
        name: "Builsa South",
        districts: [
          { name: "Builsa South District" },
        ],
      },
      {
        name: "Kassena Nankana West",
        districts: [
          { name: "Kassena Nankana West District" },
        ],
      },
      {
        name: "Navrongo Central",
        districts: [
          { name: "Kassena Nankana Municipal" },
        ],
      },
    ],
  },
  {
    name: "Upper West",
    constituencies: [
      {
        name: "Wa Central",
        districts: [
          { name: "Wa Municipal" },
        ],
      },
      {
        name: "Wa East",
        districts: [
          { name: "Wa East District" },
        ],
      },
      {
        name: "Wa West",
        districts: [
          { name: "Wa West District" },
        ],
      },
      {
        name: "Nadowli Kaleo",
        districts: [
          { name: "Nadowli Kaleo District" },
        ],
      },
      {
        name: "Daffiama Bussie Issa",
        districts: [
          { name: "Daffiama Bussie Issa District" },
        ],
      },
      {
        name: "Jirapa",
        districts: [
          { name: "Jirapa Municipal" },
        ],
      },
      {
        name: "Lambussie",
        districts: [
          { name: "Lambussie Karni District" },
        ],
      },
      {
        name: "Lawra",
        districts: [
          { name: "Lawra Municipal" },
        ],
      },
      {
        name: "Nandom",
        districts: [
          { name: "Nandom Municipal" },
        ],
      },
      {
        name: "Sissala East",
        districts: [
          { name: "Sissala East Municipal" },
        ],
      },
      {
        name: "Sissala West",
        districts: [
          { name: "Sissala West District" },
        ],
      },
    ],
  },
  {
    name: "Bono",
    constituencies: [
      {
        name: "Sunyani East",
        districts: [
          { name: "Sunyani Municipal" },
        ],
      },
      {
        name: "Sunyani West",
        districts: [
          { name: "Sunyani West Municipal" },
        ],
      },
      {
        name: "Dormaa Central",
        districts: [
          { name: "Dormaa Municipal" },
        ],
      },
      {
        name: "Dormaa East",
        districts: [
          { name: "Dormaa East District" },
        ],
      },
      {
        name: "Dormaa West",
        districts: [
          { name: "Dormaa West District" },
        ],
      },
      {
        name: "Berekum East",
        districts: [
          { name: "Berekum Municipal" },
        ],
      },
      {
        name: "Berekum West",
        districts: [
          { name: "Berekum West District" },
        ],
      },
      {
        name: "Jaman North",
        districts: [
          { name: "Jaman North District" },
        ],
      },
      {
        name: "Jaman South",
        districts: [
          { name: "Jaman South Municipal" },
        ],
      },
      {
        name: "Tain",
        districts: [
          { name: "Tain District" },
        ],
      },
      {
        name: "Wenchi",
        districts: [
          { name: "Wenchi Municipal" },
        ],
      },
      {
        name: "Banda",
        districts: [
          { name: "Banda District" },
        ],
      },
    ],
  },
  {
    name: "Bono East",
    constituencies: [
      {
        name: "Techiman North",
        districts: [
          { name: "Techiman North District" },
        ],
      },
      {
        name: "Techiman South",
        districts: [
          { name: "Techiman Municipal" },
        ],
      },
      {
        name: "Nkoranza North",
        districts: [
          { name: "Nkoranza North District" },
        ],
      },
      {
        name: "Nkoranza South",
        districts: [
          { name: "Nkoranza South Municipal" },
        ],
      },
      {
        name: "Kintampo North",
        districts: [
          { name: "Kintampo North Municipal" },
        ],
      },
      {
        name: "Kintampo South",
        districts: [
          { name: "Kintampo South District" },
        ],
      },
      {
        name: "Pru East",
        districts: [
          { name: "Pru East District" },
        ],
      },
      {
        name: "Pru West",
        districts: [
          { name: "Pru West District" },
        ],
      },
      {
        name: "Sene East",
        districts: [
          { name: "Sene East District" },
        ],
      },
      {
        name: "Sene West",
        districts: [
          { name: "Sene West District" },
        ],
      },
      {
        name: "Atebubu Amantin",
        districts: [
          { name: "Atebubu Amantin Municipal" },
        ],
      },
    ],
  },
  {
    name: "Ahafo",
    constituencies: [
      {
        name: "Asunafo North",
        districts: [
          { name: "Asunafo North Municipal" },
        ],
      },
      {
        name: "Asunafo South",
        districts: [
          { name: "Asunafo South District" },
        ],
      },
      {
        name: "Asutifi North",
        districts: [
          { name: "Asutifi North District" },
        ],
      },
      {
        name: "Asutifi South",
        districts: [
          { name: "Asutifi South District" },
        ],
      },
      {
        name: "Tano North",
        districts: [
          { name: "Tano North Municipal" },
        ],
      },
      {
        name: "Tano South",
        districts: [
          { name: "Tano South Municipal" },
        ],
      },
    ],
  },
  {
    name: "Western North",
    constituencies: [
      {
        name: "Sefwi Wiawso",
        districts: [
          { name: "Sefwi Wiawso Municipal" },
        ],
      },
      {
        name: "Sefwi Akontombra",
        districts: [
          { name: "Sefwi Akontombra District" },
        ],
      },
      {
        name: "Bibiani Anhwiaso Bekwai",
        districts: [
          { name: "Bibiani Anhwiaso Bekwai Municipal" },
        ],
      },
      {
        name: "Suaman",
        districts: [
          { name: "Suaman District" },
        ],
      },
      {
        name: "Bodi",
        districts: [
          { name: "Bodi District" },
        ],
      },
      {
        name: "Juaboso",
        districts: [
          { name: "Juaboso District" },
        ],
      },
      {
        name: "Bia East",
        districts: [
          { name: "Bia East District" },
        ],
      },
      {
        name: "Bia West",
        districts: [
          { name: "Bia West District" },
        ],
      },
      {
        name: "Aowin",
        districts: [
          { name: "Aowin Municipal" },
        ],
      },
    ],
  },
  {
    name: "Oti",
    constituencies: [
      {
        name: "Buem",
        districts: [
          { name: "Jasikan District" },
        ],
      },
      {
        name: "Akan",
        districts: [
          { name: "Kadjebi District" },
        ],
      },
      {
        name: "Krachi East",
        districts: [
          { name: "Krachi East Municipal" },
        ],
      },
      {
        name: "Krachi West",
        districts: [
          { name: "Krachi West District" },
        ],
      },
      {
        name: "Krachi Nchumuru",
        districts: [
          { name: "Krachi Nchumuru District" },
        ],
      },
      {
        name: "Nkwanta North",
        districts: [
          { name: "Nkwanta North District" },
        ],
      },
      {
        name: "Nkwanta South",
        districts: [
          { name: "Nkwanta South Municipal" },
        ],
      },
      {
        name: "Guan",
        districts: [
          { name: "Guan District" },
        ],
      },
    ],
  },
  {
    name: "Savannah",
    constituencies: [
      {
        name: "Damongo",
        districts: [
          { name: "West Gonja Municipal" },
        ],
      },
      {
        name: "Daboya Mankarigu",
        districts: [
          { name: "North Gonja District" },
        ],
      },
      {
        name: "Bole Bamboi",
        districts: [
          { name: "Bole District" },
        ],
      },
      {
        name: "Sawla Tuna Kalba",
        districts: [
          { name: "Sawla Tuna Kalba District" },
        ],
      },
      {
        name: "Salaga North",
        districts: [
          { name: "East Gonja Municipal" },
        ],
      },
      {
        name: "Salaga South",
        districts: [
          { name: "East Gonja Municipal" },
        ],
      },
      {
        name: "Yapei Kusawgu",
        districts: [
          { name: "Central Gonja District" },
        ],
      },
    ],
  },
  {
    name: "North East",
    constituencies: [
      {
        name: "Nalerigu Gambaga",
        districts: [
          { name: "East Mamprusi Municipal" },
        ],
      },
      {
        name: "Yunyoo Nasuan",
        districts: [
          { name: "Yunyoo Nasuan District" },
        ],
      },
      {
        name: "Bunkpurugu",
        districts: [
          { name: "Bunkpurugu Nakpanduri District" },
        ],
      },
      {
        name: "Walewale",
        districts: [
          { name: "West Mamprusi Municipal" },
        ],
      },
      {
        name: "Yagaba Kubori",
        districts: [
          { name: "Mamprugu Moagduri District" },
        ],
      },
      {
        name: "Chereponi",
        districts: [
          { name: "Chereponi District" },
        ],
      },
    ],
  },
];

// Helper functions
export function getRegionNames(): string[] {
  return ghanaRegions.map((r) => r.name);
}

export function getConstituenciesByRegion(regionName: string): string[] {
  const region = ghanaRegions.find((r) => r.name === regionName);
  return region ? region.constituencies.map((c) => c.name) : [];
}

export function getDistrictsByConstituency(
  regionName: string,
  constituencyName: string
): string[] {
  const region = ghanaRegions.find((r) => r.name === regionName);
  if (!region) return [];

  const constituency = region.constituencies.find(
    (c) => c.name === constituencyName
  );
  if (!constituency) return [];

  // Return unique district names
  const districts = constituency.districts.map((d) => d.name);
  return [...new Set(districts)];
}
