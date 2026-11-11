/**
 * Algeria data constants: 58 Wilayas (Official administrative divisions) and communes
 */

export interface Wilaya {
  code: string;
  name: string;
  arabicName: string;
  communes: string[];
}

export const ALGERIA_WILAYAS: Wilaya[] = [
  { code: '01', name: 'Adrar', arabicName: 'أدرار', communes: ['Adrar', 'Reggane', 'Timimoun', 'Aoulef', 'Fenoughil'] },
  { code: '02', name: 'Chlef', arabicName: 'الشلف', communes: ['Chlef', 'Ténès', 'El Karimia', 'Oued Fodda', 'Boukadir'] },
  { code: '03', name: 'Laghouat', arabicName: 'الأغواط', communes: ['Laghouat', 'Aflou', 'Ksar El Hirane', 'Aïn Madhi'] },
  { code: '04', name: 'Oum El Bouaghi', arabicName: 'أم البواقي', communes: ['Oum El Bouaghi', 'Aïn Beïda', 'Aïn M\'lila'] },
  { code: '05', name: 'Batna', arabicName: 'باتنة', communes: ['Batna', 'Barika', 'Aïn Touta', 'Merouana', 'Arris'] },
  { code: '06', name: 'Béjaïa', arabicName: 'بجاية', communes: ['Béjaïa', 'Akbou', 'Amizour', 'El Kseur', 'Sidi Aïch'] },
  { code: '07', name: 'Biskra', arabicName: 'بسكرة', communes: ['Biskra', 'Tolga', 'Sidi Okba', 'Ouled Djellal'] },
  { code: '08', name: 'Béchar', arabicName: 'بشار', communes: ['Béchar', 'Abadla', 'Beni Ounif', 'Kenadsa'] },
  { code: '09', name: 'Blida', arabicName: 'البليدة', communes: ['Blida', 'Boufarik', 'Ouled Yaïch', 'Mouzaïa', 'El Affroun'] },
  { code: '10', name: 'Bouira', arabicName: 'البويرة', communes: ['Bouira', 'Lakhdaria', 'Sour El Ghozlane', 'Aïn Bessem'] },
  { code: '11', name: 'Tamanrasset', arabicName: 'تمنراست', communes: ['Tamanrasset', 'Abalessa', 'In Amguel', 'Tazrouk'] },
  { code: '12', name: 'Tébessa', arabicName: 'تبسة', communes: ['Tébessa', 'Chréa', 'Bir El Ater', 'El Aouinet'] },
  { code: '13', name: 'Tlemcen', arabicName: 'تلمسان', communes: ['Tlemcen', 'Mansourah', 'Maghnia', 'Ghazaouet', 'Remchi'] },
  { code: '14', name: 'Tiaret', arabicName: 'تيارت', communes: ['Tiaret', 'Sougueur', 'Frenda', 'Ksar Chellala'] },
  { code: '15', name: 'Tizi Ouzou', arabicName: 'تيزي وزو', communes: ['Tizi Ouzou', 'Azazga', 'Draâ Ben Khedda', 'Boghni', 'Larbaâ Nath Irathen'] },
  { code: '16', name: 'Alger', arabicName: 'الجزائر', communes: ['Alger Centre', 'Bab El Oued', 'Hydra', 'Bab Ezzouar', 'Kouba', 'El Biar', 'Dely Ibrahim', 'Chéraga', 'Dar El Beïda', 'Zéralda', 'Rouïba'] },
  { code: '17', name: 'Djelfa', arabicName: 'الجلفة', communes: ['Djelfa', 'Aïn Oussera', 'Messaâd', 'Hassi Bahbah'] },
  { code: '18', name: 'Jijel', arabicName: 'جيجل', communes: ['Jijel', 'Taher', 'El Milia', 'El Aouana'] },
  { code: '19', name: 'Sétif', arabicName: 'سطيف', communes: ['Sétif', 'El Eulma', 'Aïn Oulmene', 'Aïn Arnat', 'Bougaa'] },
  { code: '20', name: 'Saïda', arabicName: 'سعيدة', communes: ['Saïda', 'Aïn El Hadjar', 'Youb', 'Ouled Khaled'] },
  { code: '21', name: 'Skikda', arabicName: 'سكيكدة', communes: ['Skikda', 'El Harrouch', 'Collo', 'Azzaba'] },
  { code: '22', name: 'Sidi Bel Abbès', arabicName: 'سيدي بلعباس', communes: ['Sidi Bel Abbès', 'Telagh', 'Ben Badis', 'Sfisef'] },
  { code: '23', name: 'Annaba', arabicName: 'عنابة', communes: ['Annaba', 'El Bouni', 'El Hadjar', 'Berrahal', 'Seraïdi'] },
  { code: '24', name: 'Guelma', arabicName: 'قالمة', communes: ['Guelma', 'Oued Zenati', 'Bouchegouf', 'Héliopolis'] },
  { code: '25', name: 'Constantine', arabicName: 'قسنطينة', communes: ['Constantine', 'El Khroub', 'Aïn Smara', 'Hamma Bouziane', 'Didouche Mourad', 'Zighoud Youcef'] },
  { code: '26', name: 'Médéa', arabicName: 'المدية', communes: ['Médéa', 'Berrouaghia', 'Ksar El Boukhari', 'Beni Slimane'] },
  { code: '27', name: 'Mostaganem', arabicName: 'مستغانم', communes: ['Mostaganem', 'Aïn Tedeles', 'Hassi Mameche', 'Sidi Ali'] },
  { code: '28', name: 'M\'Sila', arabicName: 'المسيلة', communes: ['M\'Sila', 'Boussaâda', 'Sidi Aïssa', 'Magra'] },
  { code: '29', name: 'Mascara', arabicName: 'معسكر', communes: ['Mascara', 'Sig', 'Tighennif', 'Mohammadia'] },
  { code: '30', name: 'Ouargla', arabicName: 'ورقلة', communes: ['Ouargla', 'Hassi Messaoud', 'Touggourt', 'Rouissat'] },
  { code: '31', name: 'Oran', arabicName: 'وهران', communes: ['Oran', 'Es Senia', 'Bir El Djir', 'Aïn El Turk', 'Arzew', 'Bethioua', 'Mers El Kébir'] },
  { code: '32', name: 'El Bayadh', arabicName: 'البيض', communes: ['El Bayadh', 'Rogassa', 'Brezina', 'Labiodh Sidi Cheikh'] },
  { code: '33', name: 'Illizi', arabicName: 'إيليزي', communes: ['Illizi', 'Djanet', 'In Amenas', 'Bordj Omar Driss'] },
  { code: '34', name: 'Bordj Bou Arréridj', arabicName: 'برج بوعريريج', communes: ['Bordj Bou Arréridj', 'Ras El Oued', 'Mansoura', 'El Hamadia'] },
  { code: '35', name: 'Boumerdès', arabicName: 'بومرداس', communes: ['Boumerdès', 'Zemmouri', 'Dellys', 'Khemis El Khechna', 'Boudouaou'] },
  { code: '36', name: 'El Tarf', arabicName: 'الطارف', communes: ['El Tarf', 'El Kala', 'Ben M\'Hidi', 'Besbes'] },
  { code: '37', name: 'Tindouf', arabicName: 'تندوف', communes: ['Tindouf', 'Oum El Assel'] },
  { code: '38', name: 'Tissemsilt', arabicName: 'تيسمسيلت', communes: ['Tissemsilt', 'Theniet El Had', 'Bordj Bounaama'] },
  { code: '39', name: 'El Oued', arabicName: 'الوادي', communes: ['El Oued', 'Robbah', 'Debila', 'Guemar', 'Hassi Khelifa'] },
  { code: '40', name: 'Khenchela', arabicName: 'خنشلة', communes: ['Khenchela', 'Chechar', 'Kaïs', 'Bouhmama'] },
  { code: '41', name: 'Souk Ahras', arabicName: 'سوق أهراس', communes: ['Souk Ahras', 'Sedrata', 'M\'Daourouch', 'Taoura'] },
  { code: '42', name: 'Tipaza', arabicName: 'تيبازة', communes: ['Tipaza', 'Cherchell', 'Koléa', 'Bou Ismaïl', 'Hadjout', 'Fouka'] },
  { code: '43', name: 'Mila', arabicName: 'ميلة', communes: ['Mila', 'Chelghoum Laïd', 'Tadjenanet', 'Ferdjioua'] },
  { code: '44', name: 'Aïn Defla', arabicName: 'عين الدفلى', communes: ['Aïn Defla', 'Khemis Miliana', 'Miliana', 'El Attaf'] },
  { code: '45', name: 'Naâma', arabicName: 'النعامة', communes: ['Naâma', 'Mécheria', 'Aïn Sefra', 'Tiout'] },
  { code: '46', name: 'Aïn Témouchent', arabicName: 'عين تموشنت', communes: ['Aïn Témouchent', 'Béni Saf', 'Hammam Bouhadjar', 'El Malah'] },
  { code: '47', name: 'Ghardaïa', arabicName: 'غرداية', communes: ['Ghardaïa', 'El Guerrara', 'Béni Isguen', 'Metlili', 'El Atteuf'] },
  { code: '48', name: 'Relizane', arabicName: 'غليزان', communes: ['Relizane', 'Oued Rhiou', 'Mazouna', 'Yellel'] },
  { code: '49', name: 'Timimoun', arabicName: 'تيميمون', communes: ['Timimoun', 'Charouine', 'Aougrout'] },
  { code: '50', name: 'Bordj Badji Mokhtar', arabicName: 'برج باجي مختار', communes: ['Bordj Badji Mokhtar', 'Timiaouine'] },
  { code: '51', name: 'Ouled Djellal', arabicName: 'أولاد جلال', communes: ['Ouled Djellal', 'Sidi Khaled', 'Ras El Miaad'] },
  { code: '52', name: 'Béni Abbès', arabicName: 'بني عباس', communes: ['Béni Abbès', 'Kerzaz', 'Tabelbala'] },
  { code: '53', name: 'In Salah', arabicName: 'عين صالح', communes: ['In Salah', 'Foggaret Ezzaouia', 'In Ghar'] },
  { code: '54', name: 'In Guezzam', arabicName: 'عين قزام', communes: ['In Guezzam', 'Tin Zaouatine'] },
  { code: '55', name: 'Touggourt', arabicName: 'تقرت', communes: ['Touggourt', 'Temacine', 'Megarine', 'Nezla'] },
  { code: '56', name: 'Djanet', arabicName: 'جانت', communes: ['Djanet', 'Bordj El Haouas'] },
  { code: '57', name: 'El M\'Ghair', arabicName: 'المغير', communes: ['El M\'Ghair', 'Djamaa', 'Oum Touyour'] },
  { code: '58', name: 'El Meniaa', arabicName: 'المنيعة', communes: ['El Meniaa', 'Hassi Gara'] },
];

export const PAYMENT_METHODS = [
  { id: 'ESPECES', label: 'Espèces (Cash)', labelAr: 'نقداً', icon: 'Banknote' },
  { id: 'CCP', label: 'CCP / BaridiMob (Algérie Poste)', labelAr: 'بريدي موب / بريد الجزائر', icon: 'CreditCard' },
  { id: 'VIREMENT', label: 'Virement bancaire (RIB)', labelAr: 'تحويل بنكي', icon: 'Building2' },
  { id: 'CHEQUE', label: 'Chèque bancaire', labelAr: 'صك بنكي', icon: 'FileText' },
  { id: 'AUTRE', label: 'Autre mode', labelAr: 'طريقة أخرى', icon: 'Layers' },
] as const;

export const FUEL_TYPES = ['Essence', 'Diesel', 'GPL', 'Hybride', 'Électrique'] as const;
export const TRANSMISSION_TYPES = ['Manuelle', 'Automatique'] as const;
