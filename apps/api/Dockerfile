FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Api.Domain/Api.Domain.csproj", "Api.Domain/"]
COPY ["Api.Application/Api.Application.csproj", "Api.Application/"]
COPY ["Api.Infrastructure/Api.Infrastructure.csproj", "Api.Infrastructure/"]
COPY ["Api.Web/Api.Web.csproj", "Api.Web/"]

RUN dotnet restore "Api.Web/Api.Web.csproj"
COPY . .
WORKDIR "/src/Api.Web"
RUN dotnet build "Api.Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Api.Web.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Api.Web.dll"]
