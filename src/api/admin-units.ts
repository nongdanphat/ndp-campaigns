import {
  metadataControllerGetOldDistricts,
  metadataControllerGetOldProvinces,
  metadataControllerGetOldWards,
} from "./generated/metadata/metadata";

export type AdminOption = {
  code: string;
  name: string;
};

export async function loadProvinces(): Promise<AdminOption[]> {
  const response = await metadataControllerGetOldProvinces();
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || "Không tải được danh sách tỉnh/thành phố");
  }

  return (body.data.provinces ?? []).map((province) => ({
    code: province.code,
    name: province.nameWithType || province.name,
  }));
}

export async function loadDistricts(
  provinceCode: string
): Promise<AdminOption[]> {
  const response = await metadataControllerGetOldDistricts({
    oldProvinceCode: provinceCode,
  });
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || "Không tải được danh sách huyện");
  }

  return (body.data.districts ?? []).map((district) => ({
    code: district.code,
    name: district.nameWithType || district.name,
  }));
}

export async function loadWards(districtCode: string): Promise<AdminOption[]> {
  const response = await metadataControllerGetOldWards({
    oldDistrictCode: districtCode,
  });
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || "Không tải được danh sách xã/phường");
  }

  return (body.data.wards ?? []).map((ward) => ({
    code: ward.code,
    name: ward.nameWithType || ward.name,
  }));
}
