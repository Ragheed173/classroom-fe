import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "@/constants";
import { CreateResponse, ListResponse } from "@/types";
import { HttpError } from "@refinedev/core";

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL is not set in the environment variables");
}

const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = "An unknown error occurred";
  let statusCode = response.status ?? 500;
  try {
    const payload = (await response.json()) as { message?: string; error?: string };
    if (payload?.message) message = payload.message;
    else if (payload?.error) message = payload.error;
  } catch {
    // ignore parse errors
  }
  return { message, statusCode };
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,
    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const params: Record<string, string | number> = { page, limit: pageSize };

      filters?.forEach((filter) => {
        const field = "field" in filter ? filter.field : "";
        const value = String(filter.value);

        if (resource === "subjects") {
          if (field === "department") params.department = value;
          if (field === "code" || field === "name" || field === "search") params.search = value;
        } else if (resource === "classes") {
          if (field === "subject") params.subject = value;
          if (field === "teacher") params.teacher = value;
          if (field === "name" || field === "search") params.search = value;
          if (field === "status") params.status = value;
        } else if (resource === "users") {
          if (field === "role") params.role = value;
          if (field === "name" || field === "email" || field === "search") params.search = value;
        } else if (resource === "departments") {
          if (field === "name" || field === "search") params.search = value;
        } else {
          // generic pass-through for nested resources like classes/:id/users
          params[field] = value;
        }
      });

      return params;
    },
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.clone().json();
      return payload.data || [];
    },
    getTotalCount: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },
  create: {
    getEndpoint: ({ resource }) => resource,
    buildBodyParams: async ({ variables }) => variables,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: CreateResponse = await response.clone().json();
      return json.data ?? {};
    },
  },
  getOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: CreateResponse = await response.clone().json();
      return json.data ?? {};
    },
  },
  update: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,
    buildBodyParams: async ({ variables }) => variables,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: CreateResponse = await response.clone().json();
      return json.data ?? {};
    },
  },
  deleteOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: CreateResponse = await response.clone().json();
      return json.data ?? {};
    },
  },
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };
